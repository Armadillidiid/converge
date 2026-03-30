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

    mockDb = {
      insert: mockInsert,
      values: mockValues,
      returning: mockReturning,
      select: mockSelect,
      from: mockFrom,
      where: mockWhere,
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

      // Mock first select for members
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockMembers),
        }),
      });

      // Mock second select for rooms
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue(mockRooms),
      });

      const result = await service.getRooms(userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("room-1");
    });
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

      mockDb.where.mockResolvedValue(mockMembers);
      mockDb.from.mockReturnValue({
        where: mockDb.where,
      });
      mockDb.select.mockReturnValue({
        from: mockDb.from,
      });

      // Mock the second select for rooms
      const mockSelectRooms = vi.fn().mockReturnValue({
        from: vi.fn().mockResolvedValue(mockRooms),
      });

      // First call to select() for members
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockMembers),
        }),
      });

      // Second call to select() for rooms
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue(mockRooms),
      });

      const result = await service.getRooms(userId);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe("room-1");
    });
  });
});
