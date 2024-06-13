import { Profile } from './api';
import { UserInfo, setUserInfo } from './user';
import { websocketConnected } from './callbacks';

const createUi = (profile: Profile, userInfo: UserInfo): HTMLElement => {
    const container = document.createElement('div');
    container.style.padding = '10px 6px';
    container.style.overflow = 'hidden';
    container.style.fontSize = '95%';

    if (!websocketConnected) {
        const websocket = document.createElement('div');
        websocket.className = 'cursor-pointer';
        websocket.textContent = 'Websocket not hooked, refresh page!';
        websocket.style.color = '#FF5733';
        websocket.style.marginBottom = '3px';
        websocket.onclick = () => location.pathname = '';
        container.append(websocket);
    }

    const nameContainer = document.createElement('div');
    nameContainer.style.display = 'flex';
    nameContainer.style.gap = '6px';
    nameContainer.style.alignItems = 'center';
    nameContainer.style.marginBottom = '5px';
    if (profile.avatar && profile.avatar !== profile.id) {
        const avatar = `https://cdn.chitchat.gg/avatars/${profile.id}/${profile.avatar}.webp`;
        const avatarLink = document.createElement('a');
        avatarLink.href = avatar;
        avatarLink.target = '_blank';
        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.width = 42;
        avatarLink.append(avatarImg);
        nameContainer.append(avatarLink);
    }
    const name = document.createElement('span');
    name.className = 'cursor-pointer';
    name.textContent = profile.username;
    name.style.flex = '1';
    name.style.fontSize = '115%';
    name.style.color = userInfo.avoid ? '#FF5733' : '#4bb643';
    name.onclick = () => {
        userInfo.avoid = !userInfo.avoid;
        name.style.color = userInfo.avoid ? '#FF5733' : '#4bb643';
        setUserInfo(profile.id, userInfo);
    };
    nameContainer.append(name);
    container.append(nameContainer);

    const matches = document.createElement('div');
    matches.style.marginBottom = '3px';
    if (userInfo.matches.length === 0) {
        matches.style.color = '#FF5733';
        matches.textContent = 'Never Matched';
    } else if (userInfo.matches.length === 1) {
        matches.style.color = '#4bb643';
        matches.textContent = 'First Match';
    } else {
        matches.className = 'cursor-pointer';
        matches.textContent = `Previously matched ${userInfo.matches.length-1} ${userInfo.matches.length-1 === 1 ? 'time' : 'times'}`;
        const matchList = document.createElement('ul');
        matchList.style.listStyleType = 'disc';
        matchList.style.marginLeft = '20px';
        matchList.style.display = 'none';
        userInfo.matches.forEach((m) => {
            const match = document.createElement('li');
            match.textContent = new Date(m).toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' });
            matchList.append(match);
        });
        matches.append(matchList);
        matches.onclick = () => matchList.style.display = matchList.style.display === 'block' ? 'none' : 'block';
    }
    container.append(matches);

    const otherNames = userInfo.names.filter(n => n !== profile.username);
    if (otherNames.length > 0) {
        const names = document.createElement('div');
        names.textContent = `Other Names: ${otherNames.join(', ')}`;
        names.style.marginBottom = '3px';
        container.append(names);
    }

    const interests = document.createElement('div');
    interests.style.marginBottom = '3px';
    interests.textContent = `Interests: ${profile.preferences.showInterests}`;
    if (profile.preferences.showInterests === 'PRIVATE') {
        interests.style.color = '#FF5733';
    } else if (profile.preferences.showInterests === 'PUBLIC') {
        interests.style.color = '#4bb643';
    }
    if (profile.interests.length > 0) {
        interests.className = 'cursor-pointer';
        const interestList = document.createElement('ul');
        interestList.style.listStyleType = 'disc';
        interestList.style.marginLeft = '20px';
        interestList.style.display = 'none';
        profile.interests.forEach((i) => {
            const interest = document.createElement('li');
            interest.textContent = i;
            interestList.append(interest);
        });
        interests.append(interestList);
        interests.onclick = () => interestList.style.display = interestList.style.display === 'block' ? 'none' : 'block';
    }
    container.append(interests);

    const oldInterests = userInfo.interests.filter(i => profile.interests.indexOf(i) === -1);
    if (oldInterests.length > 0) {
        const oldInterestsText = document.createElement('div');
        oldInterestsText.className = 'cursor-pointer';
        oldInterestsText.textContent = `Old Interests`;
        oldInterestsText.style.marginBottom = '3px';
        const oldInterestsList = document.createElement('ul');
        oldInterestsList.style.listStyleType = 'disc';
        oldInterestsList.style.marginLeft = '20px';
        oldInterestsList.style.display = 'none';
        oldInterests.forEach((i) => {
            const interest = document.createElement('li');
            interest.textContent = i;
            oldInterestsList.append(interest);
        });
        oldInterestsText.append(oldInterestsList);
        oldInterestsText.onclick = () => oldInterestsList.style.display = oldInterestsList.style.display === 'block' ? 'none' : 'block';
        container.append(oldInterestsText);
    }

    if (profile.preferences.showPremiumBadge !== 'PUBLIC' || profile.badges.length > 0) {
        const badges = document.createElement('div');
        badges.textContent = `Premium Badge hidden`;
        if (profile.badges.length > 0) {
            const badgeTexts = profile.badges.map((badge) => {
                switch (badge) {
                    case 4:
                        return `${badge} (Premium Plus)`;
                    case 5:
                        return `${badge} (Premium Basic)`;
                    default:
                        return `${badge}`;
                }
            });
            badges.textContent = `Badges: ${badgeTexts.join(', ')}`;
        }
        badges.style.color = '#63cffa';
        badges.style.marginBottom = '3px';
        container.append(badges);
    }

    const info = document.createElement('textarea');
    info.style.marginTop = '5px';
    info.style.padding = '3px 5px';
    info.style.width = '100%';
    info.value = userInfo.info;
    info.placeholder = `Info about ${profile.username}`;
    info.onblur = () => {
        if (info.value !== userInfo.info) {
            userInfo.info = info.value;
            setUserInfo(profile.id, userInfo);
        }
    }
    container.append(info);

    return container;
};

export { createUi };
