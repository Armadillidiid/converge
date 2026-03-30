import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { ChatService } from "./chat.service.js";
import { DrizzleService } from "#src/modules/drizzle/drizzle.service.js";

describe("ChatService", () => {
  let service: ChatService;
  let mockDb: any;

  beforeEach(async () => {
    const mockInsert = vi.fn().mockReturnThis();
    const mockValues = vi.fn().mockReturnThis();
    const mockReturning = vi.fn();
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();
    const mockUpdate = vi.fn().mockReturnThis();
    const mockSet = vi.fn().mockReturnThis();

    mockDb = {
      insert: mockInsert,
      values: mockValues,
      returning: mockReturning,
      select: mockSelect,
      from: mockFrom,
      where: mockWhere,
      limit: mockLimit,
      update: mockUpdate,
      set: mockSet,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: DrizzleService,
          useValue: { db: mockDb },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe("createRoom", () => {
    it("should create a room and add creator as owner", async () => {
      const userId = "user-123";
      const createRoomDto = { name: "Test Room" };

      const mockRoom = {
        id: "room-123",
        name: createRoomDto.name,
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.returning.mockResolvedValue([mockRoom]);

      const result = await service.createRoom(userId, createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("getRooms", () => {
    it("should return rooms where user is a member", async () => {
      const userId = "user-123";

      const mockMembers = [
        {
          roomId: "room-1",
          userId: "user-123",
          id: "member-1",
          role: "owner",
          joinedAt: new Date(),
        },
      ];

      const mockRooms = [
        {
          id: "room-1",
          name: "Room 1",
          ownerId: "user-123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockMembers),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue(mockRooms),
      });

      const result = await service.getRooms(userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("room-1");
    });
  });

  describe("inviteMember", () => {
    it("should create an invitation for a user", async () => {
      const inviterId = "user-123";
      const roomId = "room-123";
      const inviteeId = "user-456";

      const mockRoom = {
        id: roomId,
        ownerId: inviterId,
        name: "Test Room",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInvitation = {
        id: "invitation-123",
        roomId,
        inviterId,
        inviteeId,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };

      // Mock get room
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRoom]),
          }),
        }),
      });

      // Mock create invitation
      mockDb.returning.mockResolvedValue([mockInvitation]);

      const result = await service.inviteMember(inviterId, roomId, inviteeId);

      expect(result).toEqual(mockInvitation);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("getInvitations", () => {
    it("should return pending invitations for a user", async () => {
      const userId = "user-123";

      const mockInvitations = [
        {
          id: "invitation-1",
          roomId: "room-1",
          inviterId: "user-456",
          inviteeId: userId,
          status: "pending",
          expiresAt: new Date(),
          createdAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockInvitations),
        }),
      });

      const result = await service.getInvitations(userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.inviteeId).toBe(userId);
    });
  });

  describe("acceptInvitation", () => {
    it("should accept invitation and add user as member", async () => {
      const userId = "user-123";
      const invitationId = "invitation-123";

      const mockInvitation = {
        id: invitationId,
        roomId: "room-123",
        inviterId: "user-456",
        inviteeId: userId,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      // Mock get invitation
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockInvitation]),
          }),
        }),
      });

      // Mock update invitation
      mockDb.set.mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ ...mockInvitation, status: "accepted" }]),
        }),
      });

      const result = await service.acceptInvitation(userId, invitationId);

      expect(result!.status).toBe("accepted");
    });
  });

  describe("declineInvitation", () => {
    it("should decline invitation", async () => {
      const userId = "user-123";
      const invitationId = "invitation-123";

      const mockInvitation = {
        id: invitationId,
        roomId: "room-123",
        inviteeId: userId,
        status: "pending",
      };

      // Mock get invitation
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockInvitation]),
          }),
        }),
      });

      // Mock update invitation
      mockDb.set.mockReturnValueOnce({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ ...mockInvitation, status: "declined" }]),
        }),
      });

      const result = await service.declineInvitation(userId, invitationId);

      expect(result!.status).toBe("declined");
    });
  });
});
