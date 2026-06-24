import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { FilterTypesConstants } from '../../../constants/constants';

export class HistoryDto {
  @IsEnum(FilterTypesConstants)
  @IsNotEmpty()
  filter: string;

  @IsNumber()
  @IsPositive()
  page: number;

  @IsNumber()
  @IsPositive()
  limit: number;
}
