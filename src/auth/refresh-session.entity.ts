import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, Unique } from "typeorm";
import { Exclude } from "class-transformer";
import { User } from "./user.entity";

@Unique(["user", "fingerprint"])
@Entity()
export class RefreshSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(_type => User, user => user.id, { eager: false })
    @JoinColumn({ name: 'user_id' })
    @Exclude({toPlainOnly: true})
    user: User;

    @Column()
    refresh_token: string;

    @Column()
    fingerprint: string;

    @Column({ type: 'bigint' })
    expires_in: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
