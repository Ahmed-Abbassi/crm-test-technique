import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { OpportunityStage } from '@prisma/client';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must have at most 2 decimal places' },
  )
  @Min(0.01, { message: 'Amount must be a positive number' })
  amount!: number;

  @IsDateString()
  @IsNotEmpty()
  expectedCloseDate!: string;

  @IsEnum(OpportunityStage)
  @IsNotEmpty()
  stage!: OpportunityStage;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  clientId!: string;
}