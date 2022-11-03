function makePassword(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

const listTasks = (list) => {
    const n = "✅ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟".split(" ");
    let string = "";
    for (let i = 1; i <= 5; i++) {
        if (list.includes(i)) {
            string += `${n[0]} `;
        } else {
            string += `${n[i]} `;
        }
    }
    return string;
};

const keyboard = () => {
    let keyboard = [["Задания"], [], ["Правила квеста"]];

    return {
        keyboard: keyboard,
        resize_keyboard: true,
    };
};

const userInfo = (username, name) => {
    let info = `<b>Пользователь:</b>\n${
        username ? "@" + username : "<i>Юзернейм скрыт</i>"
    }\n${name ? name : "<i>Имя скрыто</i>"}`;
    return info;
};

const usersCount = (n) => {
    if (n == 1) {
        return "1 участник";
    } else if ([2, 3, 4].includes(n)) {
        return n + " участника";
    } else {
        return n + "участников";
    }
};

module.exports = {
    keyboard,
    listTasks,
    makePassword,
    userInfo,
    usersCount,
};
