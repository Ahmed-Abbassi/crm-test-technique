import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { ClientType } from '@prisma/client';

export class CreateClientDto {
  @IsEnum(ClientType)
  @IsNotEmpty()
  type!: ClientType;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

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
  @ValidateIf((o: CreateClientDto) => o.type === ClientType.COMPANY)
  @IsNotEmpty()
  @IsString()
  companyName?: string;

  @ValidateIf((o: CreateClientDto) => o.type === ClientType.COMPANY)
  @IsOptional()
  @IsString()
  industry?: string;

  @ValidateIf((o: CreateClientDto) => o.type === ClientType.COMPANY)
  @IsOptional()
  @IsString()
  website?: string;

  @ValidateIf((o: CreateClientDto) => o.type === ClientType.COMPANY)
  @IsOptional()
  @IsInt()
  @Min(1)
  employeeCount?: number;

  // Individual fields
  @ValidateIf((o: CreateClientDto) => o.type === ClientType.INDIVIDUAL)
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ValidateIf((o: CreateClientDto) => o.type === ClientType.INDIVIDUAL)
  @IsNotEmpty()
  @IsString()
  lastName?: string;
}