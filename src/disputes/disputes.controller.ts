import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateDisputeDto } from './dtos/create-dispute.dto';
import { DisputesService } from './disputes.service';
import { AuthGuard } from '../auth/auth.guard';
// import { Roles } from '../roles/roles.decorator';
import { UpdateDisputeDto } from './dtos/update-dispute.dto';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputeService: DisputesService) {}
  @ApiOperation({ summary: 'Raise dispute over transactions' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(
    @Request() req: any,
    @Body(ValidationPipe) createDisputeDto: CreateDisputeDto,
  ) {
    return this.disputeService.create(req.user._id, createDisputeDto);
  }

  @ApiOperation({
    summary:
      "Resolve / Reject dispute on user's transaction by admin and for users to respond to admin comments",
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'Enter the dispute id',
  })
  @Post('/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async action(
    @Request() req: any,
    @Param() params: any,
    @Body(ValidationPipe) updateDisputeDto: UpdateDisputeDto,
  ) {
    return this.disputeService.update(req, String(params.id), updateDisputeDto);
  }

  @ApiOperation({
    summary: "Shows all user's disputes and shows all users disputes to admin",
  })
  @Get('/')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async showAllDisputes(@Request() req: any) {
    return this.disputeService.showAll(req);
  }
}
