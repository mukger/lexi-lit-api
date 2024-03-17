import { ManyToOne, JoinColumn, Entity, Column, PrimaryColumn, Unique, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/auth/user.entity";

@Entity()
export class Friend {
    @PrimaryColumn()
    initiator_id: string;

    @PrimaryColumn()
    invited_id: string;

    @ManyToOne(_type => User, user => user.friend_requests, { eager: false })
    @JoinColumn({ name: 'initiator_id' })
    initiator: User;

    @ManyToOne(_type => User, user => user.friend_invites, { eager: false })
    @JoinColumn({ name: 'invited_id' })
    invited: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    inviting_date: Date;

    @Column({ type: 'boolean', default: false} )
    checked: Boolean;

    @Column({ type: 'boolean', default: false} )
    confirm: Boolean;
}