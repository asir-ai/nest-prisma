import 'temporal-polyfill/full/global';
import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    output: "./src/prisma/generated",
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});
