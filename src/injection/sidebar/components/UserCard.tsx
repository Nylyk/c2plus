import { For, Show, createMemo, createSignal } from 'solid-js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { User, db } from '../../db';
import { Profile } from '../../api';
import styles from './UserCard.module.css';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

interface UserCardProps {
    user: User,
    profile: Profile
}

const badgeName = (badges: number[]): string => {
    return badges.map((badge) => {
        switch (badge) {
            case 4:
                return `${badge} (Premium Plus)`;
            case 5:
                return `${badge} (Premium Basic)`;
            default:
                return `${badge}`;
        }
    }).join(', ');
}

export const UserCard = (props: {
    user: User,
    profile: Profile,
}) => {
    const [showMatches, setShowMatches] = createSignal(false);
    const [showInterests, setShowInterests] = createSignal(false);
    const [showPreviousInterests, setShowPreviousInterests] = createSignal(false);

    const avatarUrl = () => `https://cdn.chitchat.gg/avatars/${props.user.id}/${props.profile.avatar}.webp`;

    const age = () => dayjs(props.profile.createdAt);

    const currentInterests = createMemo(() => {
        if (props.profile.interests && props.profile.interests.length > 0) {
            return props.profile.interests;
        } else {
            return props.user.commonInterests;
        }
    }); 
    const previousInterests = () => props.user.interests.filter(i => currentInterests().indexOf(i) === -1);

    return (
        <div class={styles.usercard}>
            <div class={styles.header}>
                <Show when={props.profile.avatar && props.profile.avatar !== props.user.id}>
                    <a href={avatarUrl()} target='_blank'>
                        <img src={avatarUrl()} width='42' />
                    </a>
                </Show>
                <div>
                    <div
                        class={`${styles.name} ${styles.pointer} ${props.user.avoid ? styles.red : styles.green}`}
                        onClick={() => {
                            props.user.avoid = !props.user.avoid;
                            db.users.put(props.user);
                        }}
                    >
                        {props.user.name}
                    </div>
                    <div
                        class={`${styles.age} ${age().isAfter(dayjs().subtract(1, 'hour')) ? styles.red : ''}`}
                        title={age().format('lll')}
                    >
                        Account age: { age().fromNow(true) }
                    </div>
                </div>
            </div>

            <Show when={props.user.previousNames.length > 0}>
                <div>Other names: {props.user.previousNames.join(', ')}</div>
            </Show>

            <div class={`${styles.matches} ${styles.pointer} ${props.user.matches.length === 1 ? styles.green : ''}`} onClick={() => setShowMatches(p => !p)}>
                { props.user.matches.length === 1 ? 'First match' : `Matched ${props.user.matches.length} times` }
                <Show when={showMatches()}>
                    <ul>
                        <For each={props.user.matches}>
                            { m => <li>{new Date(m).toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })}</li> }
                        </For>
                    </ul>
                </Show>
            </div>

            <div
                class={`${styles.pointer} ${props.profile.preferences.showInterests === 'PUBLIC' ? styles.green : ''} ${props.profile.preferences.showInterests === 'PRIVATE' ? styles.red : ''}`}
                onClick={() => setShowInterests(p => !p)}
            >
                Interests: { props.profile.preferences.showInterests }
                <Show when={showInterests()}>
                    <ul>
                        <For each={currentInterests()}>
                            { i => <li>{i}</li>}
                        </For>
                    </ul>
                </Show>
            </div>

            <Show when={previousInterests().length > 0}>
                <div class={styles.pointer} onClick={() => setShowPreviousInterests(p => !p)}>
                    Previous Interests
                    <Show when={showPreviousInterests()}>
                        <ul>
                            <For each={previousInterests()}>
                                { i => <li>{i}</li>}
                            </For>
                        </ul>
                    </Show>
                </div>
            </Show>

            <Show when={props.profile.preferences.showPremiumBadge !== 'PUBLIC'}>
                <div class={styles.premium}>Premium badge hidden</div>
            </Show>
            <Show when={props.profile.badges.length > 0}>
                <div class={styles.premium}>Badges: {badgeName(props.profile.badges)}</div>
            </Show>

            <textarea
                class={styles.info}
                placeholder={`Info about ${props.user.name}`}
                value={props.user.info}
                onChange={e => {
                    props.user.info = e.target.value;
                    db.users.put(props.user)
                }}
            />
        </div>
    )
};
