import { PrismaClient, ClientType, OpportunityStage } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.opportunity.deleteMany();
  await prisma.client.deleteMany();

  // Create 3 company clients
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

  // Create 3 individual clients
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

  const bobWilson = await prisma.client.create({
    data: {
      type: ClientType.INDIVIDUAL,
      email: 'bob.wilson@email.com',
      phone: '+1-555-0203',
      address: '987 Elm St',
      city: 'Denver',
      country: 'USA',
      firstName: 'Bob',
      lastName: 'Wilson',
    },
  });

  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  // Create 10 opportunities spread across all stages
  // At least 2 late, 2 stagnant, 2 WON, 1 LOST

  const opportunities = [
    {
      title: 'Enterprise Software Deal',
      amount: 150000,
      expectedCloseDate: daysAgo(5), // LATE
      stage: OpportunityStage.NEGOTIATION,
      notes: 'Negotiating final terms with legal team',
      clientId: acmeCorp.id,
      lastStageChange: daysAgo(3),
    },
    {
      title: 'Cloud Migration Project',
      amount: 85000,
      expectedCloseDate: daysAgo(10), // LATE
      stage: OpportunityStage.PROPOSAL,
      notes: 'Proposal submitted, waiting for feedback',
      clientId: globalIndustries.id,
      lastStageChange: daysAgo(7),
    },
    {
      title: 'Consulting Engagement Q3',
      amount: 45000,
      expectedCloseDate: daysAgo(20), // LATE AND STAGNANT
      stage: OpportunityStage.QUALIFIED,
      notes: 'Scope definition in progress',
      clientId: brightPath.id,
      lastStageChange: daysAgo(20), // STAGNANT
    },
    {
      title: 'SaaS Subscription - Annual',
      amount: 24000,
      expectedCloseDate: daysAgo(25), // LATE AND STAGNANT
      stage: OpportunityStage.LEAD,
      notes: 'Initial contact made, demo scheduled',
      clientId: johnDoe.id,
      lastStageChange: daysAgo(25), // STAGNANT
    },
    {
      title: 'Data Analytics Platform',
      amount: 120000,
      expectedCloseDate: daysAgo(15), // LATE
      stage: OpportunityStage.QUALIFIED,
      notes: 'Technical requirements gathering',
      clientId: janeSmith.id,
      lastStageChange: daysAgo(15), // STAGNANT
    },
    {
      title: 'Security Audit Contract',
      amount: 35000,
      expectedCloseDate: futureDate(30),
      stage: OpportunityStage.PROPOSAL,
      notes: 'Preparing security audit proposal',
      clientId: bobWilson.id,
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
      stage: OpportunityStage.LEAD,
      notes: 'Initial discovery call completed',
      clientId: globalIndustries.id,
      lastStageChange: daysAgo(5),
    },
    {
      title: 'Managed IT Services',
      amount: 180000,
      expectedCloseDate: daysAgo(2), // Won despite late date
      stage: OpportunityStage.WON,
      notes: 'Contract signed, implementation starting',
      clientId: brightPath.id,
      lastStageChange: daysAgo(2),
    },
    {
      title: 'Infrastructure Upgrade',
      amount: 75000,
      expectedCloseDate: daysAgo(7), // Lost opportunity
      stage: OpportunityStage.LOST,
      notes: 'Client chose competitor solution',
      clientId: janeSmith.id,
      lastStageChange: daysAgo(7),
    },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({
      data: opp,
    });
  }

  console.log('Seed data created successfully');
  console.log(`Created: ${opportunities.length} opportunities`);
  console.log(`Clients: Acme Corp, Global Industries, BrightPath Solutions, John Doe, Jane Smith, Bob Wilson`);
}

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });