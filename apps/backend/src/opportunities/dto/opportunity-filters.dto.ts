import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OpportunityStage, ClientType } from '@prisma/client';

export class OpportunityFiltersDto {
  @IsOptional()
  @IsEnum(OpportunityStage)
  @Transform(({ value }) => (value === '' ? undefined : value))
  stage?: OpportunityStage;

  @IsOptional()
  @IsEnum(ClientType)
  @Transform(({ value }) => (value === '' ? undefined : value))
  clientType?: ClientType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}