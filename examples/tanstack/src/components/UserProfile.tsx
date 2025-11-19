export const UserProfile = ({
  user,
}: {
  user?: { name: string; image?: string | null; email: string } | null
}) => {
  return (
    <div className="flex items-center space-x-2">
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-200 font-medium">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      )}
      <div>
        <h1 className="font-medium">{user?.name}</h1>
        <p className="text-sm text-neutral-500">{user?.email}</p>
      </div>
    </div>
  )
}
