// Created automatically by Cursor AI (2024-12-19)
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
})
@UseGuards(WsJwtGuard)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly realtimeService: RealtimeService) {}

  async handleConnection(client: Socket) {
    const user = client.handshake.auth.user;
    if (user) {
      await this.realtimeService.addClient(user.orgId, user.id, client);
      console.log(`Client connected: ${user.id} (org: ${user.orgId})`);
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.handshake.auth.user;
    if (user) {
      await this.realtimeService.removeClient(user.orgId, user.id, client.id);
      console.log(`Client disconnected: ${user.id}`);
    }
  }

  @SubscribeMessage('subscribe:video')
  async handleSubscribeVideo(
    @MessageBody() data: { videoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.handshake.auth.user;
    if (user) {
      await client.join(`video:${data.videoId}`);
      await client.join(`org:${user.orgId}`);
      return { success: true, channel: `video:${data.videoId}` };
    }
  }

  @SubscribeMessage('unsubscribe:video')
  async handleUnsubscribeVideo(
    @MessageBody() data: { videoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`video:${data.videoId}`);
    return { success: true };
  }
}
