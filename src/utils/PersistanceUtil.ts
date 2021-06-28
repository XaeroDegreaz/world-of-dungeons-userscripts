export const loadFromStorage = async (key: string) => {
  try {
    const raw: string | undefined = await GM.getValue(key);
    return raw ? JSON.parse(raw) : undefined;
  } catch (e) {
    console.error(`WoD Userscript: Unable to load key:${key}`, e);
    return undefined;
  }
};

export const saveToStorage = async (key: string, value: any) => {
  try {
    await GM.setValue(key, JSON.stringify(value));
  } catch (e) {
    console.error(`WoD Userscript: Unable to save key:${key}`, e);
  }
};
