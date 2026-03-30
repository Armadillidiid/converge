import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";
import { schema, eq, and } from "@repo/database";
import type { AuthenticatedRequest } from "#src/types/authenticated-request.js";

@Injectable()
export class ChatMembershipGuard implements CanActivate {
  constructor(private readonly drizzle: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;
    const roomId = request.params["id"];

    if (!userId) {
      throw new ForbiddenException("User not authenticated");
    }

    if (!roomId || Array.isArray(roomId)) {
      throw new NotFoundException("Room ID not provided");
    }

    const membership = await this.drizzle.db
      .select()
      .from(schema.chatMember)
      .where(
        and(
          eq(schema.chatMember.userId, userId),
          eq(schema.chatMember.roomId, roomId),
        ),
      )
      .limit(1);

    if (membership.length === 0) {
      throw new ForbiddenException("You are not a member of this room");
    }

    return true;
  }
}

@Injectable()
export class ChatOwnershipGuard implements CanActivate {
  constructor(private readonly drizzle: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;
    const roomId = request.params["id"];

    if (!userId) {
      throw new ForbiddenException("User not authenticated");
    }

    if (!roomId || Array.isArray(roomId)) {
      throw new NotFoundException("Room ID not provided");
    }

    const room = await this.drizzle.db
      .select()
      .from(schema.chatRoom)
      .where(eq(schema.chatRoom.id, roomId))
      .limit(1);

    if (room.length === 0) {
      throw new NotFoundException("Room not found");
    }

    if (room[0]?.ownerId !== userId) {
      throw new ForbiddenException("Only room owner can perform this action");
    }

    return true;
  }
}
