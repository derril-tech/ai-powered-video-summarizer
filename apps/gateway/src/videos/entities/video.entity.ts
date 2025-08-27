// Created automatically by Cursor AI (2024-12-19)

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Organization } from '../../organizations/entities/organization.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('videos')
export class Video {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'org_id', type: 'uuid' })
  orgId: string;

  @ApiProperty()
  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId?: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  url?: string;

  @ApiProperty()
  @Column({ type: 'integer' })
  duration: number;

  @ApiProperty()
  @Column({ type: 'bigint' })
  size: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20 })
  format: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ['uploading', 'processing', 'ready', 'failed', 'deleted'],
    default: 'uploading',
  })
  status: 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';

  @ApiProperty()
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @ManyToOne(() => Project, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project?: Project;
}
