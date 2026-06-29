import { PrismaClient, LeadStatus, ClientType, OpportunityStage } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.opportunity.deleteMany();
  await prisma.client.deleteMany();
  await prisma.lead.deleteMany();

  // ─── Leads ────────────────────────────────────────────────────────────────
  const lead1 = await prisma.lead.create({
    data: {
      status: LeadStatus.NEW,
      email: 'sarah.johnson@techstartup.io',
      phone: '+1-555-0301',
      firstName: 'Sarah',
      lastName: 'Johnson',
      companyName: 'TechStartup.io',
      title: 'CTO',
      source: 'Website',
      notes: 'Downloaded whitepaper on cloud migration',
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      status: LeadStatus.CONTACTED,
      email: 'mike.chen@dataflow.com',
      phone: '+1-555-0302',
      firstName: 'Mike',
      lastName: 'Chen',
      companyName: 'DataFlow Inc',
      title: 'VP Engineering',
      source: 'LinkedIn',
      notes: 'Had initial call, interested in data pipeline solution',
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      status: LeadStatus.QUALIFIED,
      email: 'emma.wilson@greenenergy.com',
      phone: '+1-555-0303',
      firstName: 'Emma',
      lastName: 'Wilson',
      companyName: 'GreenEnergy Corp',
      title: 'Director of IT',
      source: 'Referral from Acme Corp',
      notes: 'Qualified — ready for proposal. Budget approved.',
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      status: LeadStatus.DISQUALIFIED,
      email: 'tom@smallbiz.com',
      firstName: 'Tom',
      lastName: 'Miller',
      companyName: 'SmallBiz Solutions',
      source: 'Cold outreach',
      notes: 'Budget too small for our solution',
    },
  });

  // ─── Clients (Accounts) ──────────────────────────────────────────────────
  const acmeCorp = await prisma.client.create({
    data: {
      type: ClientType.COMPANY,
      email: 'contact@acmecorp.com',
      phone: '+1-555-0101',
      address: '123 Industrial Ave',
      city: 'San Francisco',
      country: 'USA',
      companyName: 'Acme Corp',
      industry: 'Technology',
      website: 'https://acmecorp.com',
      employeeCount: 500,
    },
  });

  const globalIndustries = await prisma.client.create({
    data: {
      type: ClientType.COMPANY,
      email: 'info@globalindustries.io',
      phone: '+1-555-0102',
      address: '456 Market St',
      city: 'New York',
      country: 'USA',
      companyName: 'Global Industries',
      industry: 'Manufacturing',
      website: 'https://globalindustries.io',
      employeeCount: 1200,
    },
  });

  const brightPath = await prisma.client.create({
    data: {
      type: ClientType.COMPANY,
      email: 'hello@brightpath.co',
      phone: '+1-555-0103',
      address: '789 Innovation Blvd',
      city: 'Austin',
      country: 'USA',
      companyName: 'BrightPath Solutions',
      industry: 'Healthcare',
      website: 'https://brightpath.co',
      employeeCount: 300,
    },
  });

  const johnDoe = await prisma.client.create({
    data: {
      type: ClientType.INDIVIDUAL,
      email: 'john.doe@email.com',
      phone: '+1-555-0201',
      address: '321 Oak St',
      city: 'Portland',
      country: 'USA',
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  const janeSmith = await prisma.client.create({
    data: {
      type: ClientType.INDIVIDUAL,
      email: 'jane.smith@email.com',
      phone: '+1-555-0202',
      address: '654 Pine St',
      city: 'Seattle',
      country: 'USA',
      firstName: 'Jane',
      lastName: 'Smith',
    },
  });

  // ─── Opportunities (deals after conversion) ──────────────────────────────
  const now = new Date();
  const daysAgo = (days: number) => { const d = new Date(now); d.setDate(d.getDate() - days); return d; };
  const futureDate = (days: number) => { const d = new Date(now); d.setDate(d.getDate() + days); return d; };

  const opportunities = [
    {
      title: 'Enterprise Software Platform',
      amount: 150000,
      expectedCloseDate: futureDate(30),
      stage: OpportunityStage.NEGOTIATION,
      notes: 'Negotiating final terms with legal team',
      clientId: acmeCorp.id,
      lastStageChange: daysAgo(3),
    },
    {
      title: 'Cloud Migration Project',
      amount: 85000,
      expectedCloseDate: futureDate(45),
      stage: OpportunityStage.PROPOSAL,
      notes: 'Proposal submitted, waiting for feedback',
      clientId: globalIndustries.id,
      lastStageChange: daysAgo(7),
    },
    {
      title: 'Data Analytics Platform',
      amount: 120000,
      expectedCloseDate: futureDate(60),
      stage: OpportunityStage.PROSPECTING,
      notes: 'Initial discovery call completed',
      clientId: brightPath.id,
      lastStageChange: daysAgo(5),
    },
    {
      title: 'Security Audit Contract',
      amount: 35000,
      expectedCloseDate: futureDate(30),
      stage: OpportunityStage.PROPOSAL,
      notes: 'Preparing security audit proposal',
      clientId: johnDoe.id,
      lastStageChange: daysAgo(2),
    },
    {
      title: 'Hardware Refresh Program',
      amount: 200000,
      expectedCloseDate: futureDate(45),
      stage: OpportunityStage.NEGOTIATION,
      notes: 'Vendor selection in final stage',
      clientId: acmeCorp.id,
      lastStageChange: daysAgo(1),
    },
    {
      title: 'CRM Implementation',
      amount: 95000,
      expectedCloseDate: futureDate(60),
      stage: OpportunityStage.PROSPECTING,
      notes: 'Initial discovery call completed',
      clientId: globalIndustries.id,
      lastStageChange: daysAgo(5),
    },
    {
      title: 'Managed IT Services',
      amount: 180000,
      expectedCloseDate: daysAgo(2),
      stage: OpportunityStage.CLOSED_WON,
      notes: 'Contract signed, implementation starting',
      clientId: brightPath.id,
      lastStageChange: daysAgo(2),
    },
    {
      title: 'Infrastructure Upgrade',
      amount: 75000,
      expectedCloseDate: daysAgo(7),
      stage: OpportunityStage.CLOSED_LOST,
      notes: 'Client chose competitor solution',
      clientId: janeSmith.id,
      lastStageChange: daysAgo(7),
    },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({ data: opp });
  }

  console.log('Seed data created successfully');
  console.log(`Created: 4 leads, 5 clients, ${opportunities.length} opportunities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });