export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export const decodeUser = (token: string): AuthUser | null => {
  try {
    const payload = token.split(".")[1];

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const claims = JSON.parse(json);
    const role = claims.role;

    return {
      id: claims.sub,
      email: claims.email,
      name: claims.name,
      roles: Array.isArray(role) ? role : role ? [role] : [],
    };
  } catch {
    return null;
  }
};
