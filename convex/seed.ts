// Seed data for the gear database
// Run this with: npx convex run seed:seedGear

import { mutation } from './_generated/server';

const gearData = [
  { name: 'Batoh', type: 'all' as const, group: 'Zavazadla', amount: 1 },

  { name: 'Stan', type: 'tent' as const, group: 'Ubytování', amount: 1 },
  { name: 'Spacák', type: 'tent' as const, group: 'Ubytování', amount: 1 },
  { name: 'Karimatka', type: 'tent' as const, group: 'Ubytování', amount: 1 },
  { name: 'Polštář', type: 'all' as const, group: 'Ubytování', amount: 1 },

  { name: 'Ručník', type: 'hotel' as const, group: 'Hygiena', amount: 1 },
  { name: 'Zubní kartáček', type: 'all' as const, group: 'Hygiena', amount: 1 },
  { name: 'Zubní pasta', type: 'all' as const, group: 'Hygiena', amount: 1 },
  { name: 'Mýdlo', type: 'all' as const, group: 'Hygiena', amount: 1 },

  { name: 'Trička', type: 'all' as const, group: 'Oblečení', amount: 3 },
  { name: 'Kalhoty', type: 'all' as const, group: 'Oblečení', amount: 2 },
  { name: 'Spodní prádlo', type: 'all' as const, group: 'Oblečení', amount: 5 },
  { name: 'Ponožky', type: 'all' as const, group: 'Oblečení', amount: 5 },
  { name: 'Boty', type: 'all' as const, group: 'Oblečení', amount: 1 },
  { name: 'Peněženka', type: 'all' as const, group: 'Doklady', amount: 1 },
  { name: 'Telefon', type: 'all' as const, group: 'Elektronika', amount: 1 },
  { name: 'Nabíječka', type: 'all' as const, group: 'Elektronika', amount: 1 },
];

export const seedGear = mutation({
  args: {},
  handler: async (ctx) => {
    const existingGear = await ctx.db.query('gear').collect();
    for (const item of existingGear) {
      await ctx.db.delete(item._id);
    }

    for (const item of gearData) {
      await ctx.db.insert('gear', item);
    }

    return { success: true, count: gearData.length };
  },
});
