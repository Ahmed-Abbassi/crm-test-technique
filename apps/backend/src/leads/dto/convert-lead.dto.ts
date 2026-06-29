import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';

export class ConvertLeadDto {
  @IsOptional()
  @IsBoolean()
  createOpportunity?: boolean;

  @IsOptional()
  @IsString()
  opportunityTitle?: string;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Amount must be a positive number' })
  opportunityAmount?: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;
}