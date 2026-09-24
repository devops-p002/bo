import { ConflictError, NotFoundError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database, MemberGroupStatus } from './db/schema.js';

const MemberGroupId = defineId('MemberGroupId');

export interface CreateMemberGroupInput {
  name: string;
  category?: string | undefined;
  status?: MemberGroupStatus | undefined;
}

export interface UpdateMemberGroupInput {
  name?: string | undefined;
  category?: string | undefined;
  status?: MemberGroupStatus | undefined;
}

export class MemberGroupsService {
  constructor(private readonly db: Kysely<Database>) {}

  async list() {
    const rows = await this.db
      .selectFrom('member_groups')
      .leftJoin('member_group_members', 'member_group_members.group_id', 'member_groups.id')
      .select(['member_groups.id', 'member_groups.name', 'member_groups.category', 'member_groups.status', 'member_groups.created_at'])
      .select((eb) => eb.fn.count<string>('member_group_members.player_id').as('memberCount'))
      .groupBy(['member_groups.id', 'member_groups.name', 'member_groups.category', 'member_groups.status', 'member_groups.created_at'])
      .orderBy('member_groups.created_at', 'desc')
      .execute();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      status: row.status,
      memberCount: Number.parseInt(row.memberCount, 10),
      createdAt: row.created_at.toISOString(),
    }));
  }

  async create(input: CreateMemberGroupInput) {
    const existing = await this.db.selectFrom('member_groups').select('id').where('name', '=', input.name).executeTakeFirst();
    if (existing) throw new ConflictError(`A group named "${input.name}" already exists`);

    const id = MemberGroupId.generate();
    await this.db
      .insertInto('member_groups')
      .values({ id, name: input.name, category: input.category ?? null, status: input.status ?? 'ACTIVE' })
      .execute();
    return { id };
  }

  async update(id: string, input: UpdateMemberGroupInput) {
    const existing = await this.db.selectFrom('member_groups').select('id').where('id', '=', id).executeTakeFirst();
    if (!existing) throw new NotFoundError(`Member group ${id} not found`);

    const values: Record<string, unknown> = {};
    if (input.name !== undefined) values.name = input.name;
    if (input.category !== undefined) values.category = input.category;
    if (input.status !== undefined) values.status = input.status;

    if (Object.keys(values).length > 0) {
      await this.db.updateTable('member_groups').set(values).where('id', '=', id).execute();
    }
    return { id };
  }

  async delete(id: string) {
    const existing = await this.db.selectFrom('member_groups').select('id').where('id', '=', id).executeTakeFirst();
    if (!existing) throw new NotFoundError(`Member group ${id} not found`);
    await this.db.deleteFrom('member_groups').where('id', '=', id).execute();
  }

  async listMembers(groupId: string) {
    const existing = await this.db.selectFrom('member_groups').select('id').where('id', '=', groupId).executeTakeFirst();
    if (!existing) throw new NotFoundError(`Member group ${groupId} not found`);

    const rows = await this.db
      .selectFrom('member_group_members')
      .innerJoin('players', 'players.id', 'member_group_members.player_id')
      .select(['players.id', 'players.username', 'players.email', 'member_group_members.added_at'])
      .where('member_group_members.group_id', '=', groupId)
      .orderBy('member_group_members.added_at', 'desc')
      .execute();

    return rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      addedAt: row.added_at.toISOString(),
    }));
  }

  async addMember(groupId: string, playerId: string) {
    const group = await this.db.selectFrom('member_groups').select('id').where('id', '=', groupId).executeTakeFirst();
    if (!group) throw new NotFoundError(`Member group ${groupId} not found`);
    const player = await this.db.selectFrom('players').select('id').where('id', '=', playerId).executeTakeFirst();
    if (!player) throw new NotFoundError(`Player ${playerId} not found`);

    await this.db
      .insertInto('member_group_members')
      .values({ group_id: groupId, player_id: playerId })
      .onConflict((oc) => oc.columns(['group_id', 'player_id']).doNothing())
      .execute();
  }

  async removeMember(groupId: string, playerId: string) {
    await this.db.deleteFrom('member_group_members').where('group_id', '=', groupId).where('player_id', '=', playerId).execute();
  }
}
