export default function UserAvatar({ user, className = "h-11 w-11", alt }) {
  if (user?.avatar) return <img src={user.avatar} alt={alt || user.name || "User"} className={`${className} rounded-full object-cover ring-2 ring-white`}/>;
  const initials = String(user?.name || "Campus User").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <span role="img" aria-label={alt || `${user?.name || "User"} avatar`} className={`${className} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 text-sm font-black text-white ring-2 ring-white`}>{initials}</span>;
}
