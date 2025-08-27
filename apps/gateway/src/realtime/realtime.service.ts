// Created automatically by Cursor AI (2024-12-19)
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class RealtimeService {
  private clients: Map<string, Map<string, Socket>> = new Map(); // orgId -> userId -> socket

  async addClient(orgId: string, userId: string, socket: Socket) {
    if (!this.clients.has(orgId)) {
      this.clients.set(orgId, new Map());
    }
    this.clients.get(orgId)!.set(userId, socket);
  }

  async removeClient(orgId: string, userId: string, socketId: string) {
    const orgClients = this.clients.get(orgId);
    if (orgClients) {
      const client = orgClients.get(userId);
      if (client && client.id === socketId) {
        orgClients.delete(userId);
      }
      if (orgClients.size === 0) {
        this.clients.delete(orgId);
      }
    }
  }

  async broadcastToVideo(videoId: string, event: string, data: any) {
    // This will be called by the WebSocket server to broadcast to video room
    // Implementation depends on how we access the server instance
  }

  async broadcastToOrg(orgId: string, event: string, data: any) {
    const orgClients = this.clients.get(orgId);
    if (orgClients) {
      for (const socket of orgClients.values()) {
        socket.emit(event, data);
      }
    }
  }

  async sendToUser(orgId: string, userId: string, event: string, data: any) {
    const orgClients = this.clients.get(orgId);
    if (orgClients) {
      const socket = orgClients.get(userId);
      if (socket) {
        socket.emit(event, data);
      }
    }
  }
}
