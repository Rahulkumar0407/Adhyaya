import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Users,
    UserCheck,
    UserX,
    Crown,
    GraduationCap,
    Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers, getUserDossier } from '../../services/adminService';
import GlassCard from '../../components/admin/GlassCard';
import NeonButton from '../../components/admin/NeonButton';
import UserDossier from '../../components/admin/UserDossier';

const UserInspector = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [filters, setFilters] = useState({
        role: '',
        isActive: undefined,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch users
    const {
        data: usersData,
        isLoading: isLoadingUsers,
        refetch: refetchUsers,
    } = useQuery({
        queryKey: ['admin-users', debouncedQuery, filters],
        queryFn: () => searchUsers(debouncedQuery, { ...filters, limit: 50 }),
        keepPreviousData: true,
    });

    // Fetch selected user dossier
    const {
        data: dossierData,
        isLoading: isLoadingDossier,
        refetch: refetchDossier,
    } = useQuery({
        queryKey: ['admin-user-dossier', selectedUserId],
        queryFn: () => getUserDossier(selectedUserId),
        enabled: !!selectedUserId,
    });

    const users = usersData?.users || [];
    const stats = usersData?.stats || { total: 0, active: 0, students: 0, mentors: 0, admins: 0 };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return Crown;
            case 'mentor':
                return UserCheck;
            default:
                return GraduationCap;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'text-purple-400 bg-purple-500/20';
            case 'mentor':
                return 'text-cyan-400 bg-cyan-500/20';
            default:
                return 'text-gray-400 bg-gray-500/20';
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* Left Panel - User List */}
            <div className="w-[420px] flex flex-col">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, color: 'cyan' },
                        { label: 'Active', value: stats.active, icon: UserCheck, color: 'green' },
                        { label: 'Students', value: stats.students, icon: GraduationCap, color: 'purple' },
                        { label: 'Mentors', value: stats.mentors, icon: Crown, color: 'orange' },
                    ].map((stat) => (
                        <GlassCard key={stat.label} padding="p-3" neonColor={stat.color} hover={false}>
                            <stat.icon className={`w-4 h-4 mb-1 text-${stat.color}-400`} />
                            <p className="text-lg font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </GlassCard>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, email, or ID..."
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-900/50 border border-cyan-500/10 
              text-white placeholder:text-gray-500 outline-none
              focus:border-cyan-500/30 transition-colors"
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors
              ${showFilters ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 overflow-hidden"
                        >
                            <GlassCard padding="p-4" hover={false}>
                                <div className="flex flex-wrap gap-3">
                                    <select
                                        value={filters.role}
                                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                        className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm outline-none"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="student">Students</option>
                                        <option value="mentor">Mentors</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                    <select
                                        value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                                            })
                                        }
                                        className="px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm outline-none"
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                    <NeonButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFilters({ role: '', isActive: undefined })}
                                    >
                                        Clear
                                    </NeonButton>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* User List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-cyan-900/30">
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <UserX className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">No users found</p>
                            <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        users.map((user) => {
                            const RoleIcon = getRoleIcon(user.role);
                            const isSelected = selectedUserId === user._id;

                            return (
                                <motion.div
                                    key={user._id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => setSelectedUserId(user._id)}
                                    className={`
                    relative p-4 rounded-xl cursor-pointer transition-all duration-200
                    ${isSelected ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-gray-900/30 border-transparent hover:bg-gray-800/50'}
                    border
                  `}
                                >
                                    {/* Selected indicator */}
                                    {isSelected && (
                                        <motion.div
                                            layoutId="selectedUser"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-cyan-400 to-purple-500"
                                        />
                                    )}

                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                                style={{
                                                    background: user.avatar
                                                        ? `url(${user.avatar})`
                                                        : 'linear-gradient(135deg, #00f0ff 0%, #bf00ff 100%)',
                                                    backgroundSize: 'cover',
                                                }}
                                            >
                                                {!user.avatar && user.name?.[0]?.toUpperCase()}
                                            </div>
                                            {/* Online/Active indicator */}
                                            <div
                                                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900
                          ${user.isActive ? 'bg-green-500' : 'bg-gray-500'}`}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-white truncate">{user.name}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(user.role)}`}>
                                                    <RoleIcon className="w-3 h-3 inline mr-1" />
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-cyan-400">{user.xpPoints} XP</p>
                                            <p className="text-xs text-gray-500">Lvl {user.level}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Panel - User Dossier */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedUserId ? (
                        isLoadingDossier ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400">Loading user dossier...</p>
                                </div>
                            </motion.div>
                        ) : dossierData?.user ? (
                            <motion.div
                                key={selectedUserId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full"
                            >
                                <UserDossier
                                    user={dossierData.user}
                                    wallet={dossierData.wallet}
                                    activities={dossierData.activities}
                                    revisions={dossierData.revisions}
                                    onRefresh={() => {
                                        refetchDossier();
                                        refetchUsers();
                                    }}
                                />
                            </motion.div>
                        ) : null
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex items-center justify-center"
                        >
                            <div className="text-center">
                                <div
                                    className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(191, 0, 255, 0.1) 100%)',
                                        border: '1px solid rgba(0, 240, 255, 0.2)',
                                    }}
                                >
                                    <Users className="w-12 h-12 text-cyan-400/50" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Select a User</h3>
                                <p className="text-gray-500 max-w-sm">
                                    Choose a user from the list to view their complete dossier including
                                    activity, transactions, and account details.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default UserInspector;
