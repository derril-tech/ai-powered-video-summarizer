// Created automatically by Cursor AI (2024-12-19)
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nats from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsService.name);
  private nc: nats.NatsConnection;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const natsUrl = this.configService.get('NATS_URL', 'nats://localhost:4222');
    
    try {
      this.nc = await nats.connect({ servers: natsUrl });
      this.logger.log(`Connected to NATS at ${natsUrl}`);
    } catch (error) {
      this.logger.error(`Failed to connect to NATS: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.nc) {
      await this.nc.drain();
      this.nc.close();
      this.logger.log('NATS connection closed');
    }
  }

  async publish(subject: string, data: any): Promise<void> {
    try {
      const payload = JSON.stringify(data);
      this.nc.publish(subject, Buffer.from(payload));
      this.logger.debug(`Published message to ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to ${subject}: ${error.message}`);
      throw error;
    }
  }

  async subscribe(subject: string, callback: (data: any) => void): Promise<nats.Subscription> {
    try {
      const subscription = this.nc.subscribe(subject, {
        callback: (err, msg) => {
          if (err) {
            this.logger.error(`Error in subscription ${subject}: ${err.message}`);
            return;
          }
          
          try {
            const data = JSON.parse(msg.data.toString());
            callback(data);
          } catch (parseError) {
            this.logger.error(`Failed to parse message from ${subject}: ${parseError.message}`);
          }
        },
      });

      this.logger.log(`Subscribed to ${subject}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to subscribe to ${subject}: ${error.message}`);
      throw error;
    }
  }

  async request(subject: string, data: any, timeout: number = 5000): Promise<any> {
    try {
      const payload = JSON.stringify(data);
      const response = await this.nc.request(subject, Buffer.from(payload), { timeout });
      return JSON.parse(response.data.toString());
    } catch (error) {
      this.logger.error(`Failed to make request to ${subject}: ${error.message}`);
      throw error;
    }
  }
}
