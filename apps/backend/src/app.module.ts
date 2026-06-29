import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [PrismaModule, ClientsModule, OpportunitiesModule, LeadsModule],
})
export class AppModule {}