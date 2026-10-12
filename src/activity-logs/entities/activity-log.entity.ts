import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Routine } from '../../routines/entities/routine.entity';

import { ActivityExercise } from './activity-exercise.entity';

@Entity('activity_logs')
export class ActivityLog {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Routine, (routine) => routine.activityLogs, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'routine_id' })
    routine: Routine;

    @Column({ name: 'started_at', type: 'timestamp' })
    startedAt: Date;

    @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => ActivityExercise, (activityExercise) => activityExercise.activityLog)
    activityExercises: ActivityExercise[];
}
