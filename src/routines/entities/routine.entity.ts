import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';

import { RoutineExercise } from './routine-exercise.entity';

@Entity('routines')
export class Routine {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => RoutineExercise, (routineExercise) => routineExercise.routine)
    routineExercises: RoutineExercise[];

    @OneToMany(() => ActivityLog, (activityLog) => activityLog.routine)
    activityLogs: ActivityLog[];
}
