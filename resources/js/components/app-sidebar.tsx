import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, CreditCard, Users, Key, FileText, Banknote, ListCollapse, Settings } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as { auth: { user?: { role: string } } };
    const isAdmin = auth.user?.role === 'admin';

    const mainNavItems: NavItem[] = isAdmin
        ? [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Payments',
                href: '/payments',
                icon: CreditCard,
            },
            {
                title: 'Merchants',
                href: '/merchants',
                icon: Users,
            },
            {
                title: 'Withdrawals',
                href: '/withdrawals',
                icon: Banknote,
            },
            {
                title: 'Global Settings',
                href: '/global-settings',
                icon: Settings,
            },
        ]
        : [
            {
                title: 'Dashboard',
                href: '/merchant',
                icon: LayoutGrid,
            },
            {
                title: 'Transactions',
                href: '/merchant/transactions',
                icon: ListCollapse,
            },
            {
                title: 'Withdrawals',
                href: '/merchant/withdrawals',
                icon: Banknote,
            },
            {
                title: 'API Docs',
                href: '/docs',
                icon: FileText,
            },
        ];

    const footerNavItems: NavItem[] = [
        {
            title: 'API Documentation',
            href: '/docs',
            icon: FileText,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdmin ? '/dashboard' : '/merchant'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
