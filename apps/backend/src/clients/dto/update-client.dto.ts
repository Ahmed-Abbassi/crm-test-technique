import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { ClientType } from '@prisma/client';

export class UpdateClientDto {
  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Company fields
  @ValidateIf((o: UpdateClientDto) => o.type === ClientType.COMPANY || !o.type)
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  employeeCount?: number;

  // Individual fields
  @ValidateIf(
    (o: UpdateClientDto) => o.type === ClientType.INDIVIDUAL || !o.type,
  )
  @IsOptional()
  @IsString()
  firstName?: string;

  @ValidateIf(
    (o: UpdateClientDto) => o.type === ClientType.INDIVIDUAL || !o.type,
  )
  @IsOptional()
  @IsString()
  lastName?: string;
}