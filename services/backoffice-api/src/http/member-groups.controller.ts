import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MemberGroupsService } from '../member-groups.service.js';
import type { AddGroupMemberDto, CreateMemberGroupDto, UpdateMemberGroupDto } from './dto.js';
import { addGroupMemberSchema, createMemberGroupSchema, updateMemberGroupSchema } from './dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

@Controller('member-groups')
@UseGuards(JwtAuthGuard)
export class MemberGroupsController {
  constructor(private readonly memberGroups: MemberGroupsService) {}

  @Get()
  async list() {
    return this.memberGroups.list();
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createMemberGroupSchema)) body: CreateMemberGroupDto) {
    return this.memberGroups.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ZodValidationPipe(updateMemberGroupSchema)) body: UpdateMemberGroupDto) {
    return this.memberGroups.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.memberGroups.delete(id);
    return { ok: true };
  }

  @Get(':id/members')
  async listMembers(@Param('id') id: string) {
    return this.memberGroups.listMembers(id);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body(new ZodValidationPipe(addGroupMemberSchema)) body: AddGroupMemberDto) {
    await this.memberGroups.addMember(id, body.playerId);
    return { ok: true };
  }

  @Delete(':id/members/:playerId')
  async removeMember(@Param('id') id: string, @Param('playerId') playerId: string) {
    await this.memberGroups.removeMember(id, playerId);
    return { ok: true };
  }
}
