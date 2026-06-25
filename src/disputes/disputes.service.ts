import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Dispute } from './disputes.schema';
import { CreateDisputeDto } from './dtos/create-dispute.dto';
import { Transaction } from '../transactions/transaction.schema';
import { UpdateDisputeDto } from './dtos/update-dispute.dto';
import { isMongoId } from 'class-validator';

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Dispute.name) private readonly disputeModel: Model<Dispute>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectConnection() private disputeConnection: Connection,
  ) {}

  async create(userId: string, createDisputeDto: CreateDisputeDto) {
    const existingTransaction = await this.transactionModel.findOne({
      payerId: userId,
      type: 'TRANSFER',
      reference: createDisputeDto.transactionRefNumber,
    });
    if (!existingTransaction)
      throw new NotFoundException(
        `No Transaction found with this ref number: ${createDisputeDto.transactionRefNumber}`,
      );
    const existingDispute = await this.disputeModel.findOne({
      userId,
      transactionRefNumber: createDisputeDto.transactionRefNumber,
    });

    if (existingDispute && existingDispute.status === 'RESOLVED')
      return {
        message: 'This dispute is resolved',
        dispute: existingDispute,
      };
    if (existingDispute && existingDispute.status === 'PENDING')
      return {
        message: 'This dispute is already receiving attention by admin',
        dispute: existingDispute,
      };

    const session = await this.disputeConnection.startSession();
    session.startTransaction();

    try {
      const newDispute = new this.disputeModel({
        transactionRefNumber: createDisputeDto.transactionRefNumber,
        userId,
        disputeType: createDisputeDto.disputeType.toUpperCase(),
      });
      newDispute.messages.push(createDisputeDto.comment);
      await newDispute.save({ session });
      await session.commitTransaction();
      return {
        message: 'Dispute has been logged',
        dispute: newDispute,
      };
    } catch (err) {
      await session.abortTransaction();
      const error = String(err);
      const startMessage = 'Cannot create dispute';
      if (error.includes('NotFoundException'))
        throw new NotFoundException(`${startMessage} ${error}`);
      else if (error.includes('BadRequestException'))
        throw new BadRequestException(`${startMessage} ${error}`);
      else
        throw new InternalServerErrorException(
          `${startMessage} at the moment, please try again`,
        );
    } finally {
      session.endSession();
    }
  }

  async update(
    req: any,
    disputeId: string,
    updateDisputeDto: UpdateDisputeDto,
  ) {
    const { _id, role } = req.user;
    if (!disputeId || !isMongoId(disputeId))
      throw new BadRequestException('Dispute id is required');
    const existingDispute = await this.disputeModel.findById(disputeId).exec();

    if (!existingDispute)
      throw new NotFoundException(
        `No Dispute found with this id: ${disputeId}`,
      );

    if (String(existingDispute.userId) !== _id && role !== 'ADMIN')
      throw new UnauthorizedException(
        "You are not authorized to view another person's dispute information",
      );

    if (existingDispute && existingDispute.status === 'RESOLVED')
      return {
        message: 'This dispute is resolved',
        dispute: existingDispute,
      };

    if (existingDispute && existingDispute.status === 'REJECTED')
      return {
        message: 'This dispute is rejected and cannot be updated',
        dispute: existingDispute,
      };

    const session = await this.disputeConnection.startSession();
    session.startTransaction();

    try {
      const { disputeStatus, comment } = updateDisputeDto;
      // update by user
      if (role !== 'ADMIN') {
        if (existingDispute.adminComments.length < 1)
          throw new BadRequestException(
            'Admin is yet to respond to your dispute, please hold on',
          );
        const userComment = comment;
        existingDispute.status = 'PENDING';
        existingDispute.messages.push(userComment);
      } else {
        // Update based on status of admin action PENDING | RESOLVED | REJECTED
        const adminComment = comment;
        existingDispute.adminComments.push(adminComment);
        if (disputeStatus === 'RESOLVED' || disputeStatus === 'REJECTED')
          existingDispute.status = disputeStatus;
      }

      existingDispute.updatedAt = new Date();

      await existingDispute.save({ session });
      await session.commitTransaction();

      return {
        message: 'Dispute has been updated by you',
        dispute: existingDispute,
      };
    } catch (err) {
      console.error(err);
      await session.abortTransaction();
      const error = String(err);
      const startMessage = 'Cannot update dispute';
      if (error.includes('NotFoundException'))
        throw new NotFoundException(`${startMessage} ${error}`);
      else if (error.includes('BadRequestException'))
        throw new BadRequestException(`${startMessage} ${error}`);
      else if (error.includes('UnauthorizedException'))
        throw new UnauthorizedException(`${startMessage} ${error}`);
      else
        throw new InternalServerErrorException(
          `${startMessage} at the moment, please try again`,
        );
    } finally {
      session.endSession();
    }
  }
  async showAll(req: any) {
    const { _id, role } = req.user;

    const session = await this.disputeConnection.startSession();
    session.startTransaction();

    try {
      let disputes = [];
      if (role !== 'ADMIN') {
        disputes = await this.disputeModel
          .find({ userId: _id })
          .session(session)
          .sort({ createdAt: -1 })
          .exec();
        if (disputes.length < 1)
          throw new NotFoundException('No disputes found');
      } else {
        disputes = await this.disputeModel
          .find()
          .session(session)
          .sort({ createdAt: -1 })
          .exec();
      }

      await session.commitTransaction();

      return { message: `For ${role}`, disputes };
    } catch (err) {
      console.error(err);
      await session.abortTransaction();
      const error = String(err);
      const startMessage = 'Cannot update dispute';
      if (error.includes('NotFoundException'))
        throw new NotFoundException(`${startMessage} ${error}`);
      else if (error.includes('BadRequestException'))
        throw new BadRequestException(`${startMessage} ${error}`);
      else if (error.includes('UnauthorizedException'))
        throw new UnauthorizedException(`${startMessage} ${error}`);
      else
        throw new InternalServerErrorException(
          `${startMessage} at the moment, please try again`,
        );
    } finally {
      session.endSession();
    }
  }
}
