export async function fetchList(customDir = './data') {
    try {
        const response = await fetch(`${customDir}/_list.json`);
        if (!response.ok) {
            throw new Error(`Failed to load list index: ${response.status}`);
        }

        const names = await response.json();
        if (!Array.isArray(names)) {
            return [];
        }

        const entries = await Promise.all(
            names.map(async (name) => {
                try {
                    const entryResponse = await fetch(`${customDir}/${name}.json`);
                    if (!entryResponse.ok) {
                        throw new Error(`Failed to load ${name}.json`);
                    }
                    return [await entryResponse.json(), null];
                } catch {
                    return [null, name];
                }
            }),
        );

        return entries;
    } catch {
        return [];
    }
}

export async function fetchEditors(customDir = './data') {
    try {
        const response = await fetch(`${customDir}/_editors.json`);
        if (!response.ok) {
            throw new Error(`Failed to load editors: ${response.status}`);
        }

        const editors = await response.json();
        return Array.isArray(editors) ? editors : [];
    } catch {
        return [];
    }
}

export async function fetchLeaderboard(customDir = './data') {
    const list = await fetchList(customDir);

    if (!Array.isArray(list)) {
        return [[], []];
    }

    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err || !level) {
            if (err) {
                errs.push(err);
            }
            return;
        }

        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };

        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });

        if (!Array.isArray(level.records)) {
            return;
        }

        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };

            const { completed, progressed } = scoreMap[user];
            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
            });
        });
    });

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    return [res.sort((a, b) => b.total - a.total), errs];
}

function score(rank, percent, minPercent) {
    if (rank > 150) {
        return 0;
    }
    if (rank > 75 && percent < 100) {
        return 0;
    }

    let scoreValue = (-24.9975 * Math.pow(rank - 1, 0.4) + 200) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    scoreValue = Math.max(0, scoreValue);

    if (percent != 100) {
        return round(scoreValue - scoreValue / 3);
    }

    return Math.max(round(scoreValue), 0);
}

function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + 3) + 'e-' + 3);
    }

    const arr = ('' + num).split('e');
    let sig = '';
    if (+arr[1] + 3 > 0) {
        sig = '+';
    }

    return +(
        Math.round(+arr[0] + 'e' + sig + (+arr[1] + 3)) +
        'e-' +
        3
    );
}
