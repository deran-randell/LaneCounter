import { CogIcon, ChartBarIcon, ViewGridIcon, PresentationChartLineIcon } from '@heroicons/react/outline';

export const SideBarData = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        Icon: ViewGridIcon
    },
    {
        title: 'Lane Detail',
        path: '/laneDetail',
        Icon: ChartBarIcon,
        children: [
            {
                title: 'Lane 1',
                path: '1',
                Icon: PresentationChartLineIcon
            },
            {
                title: 'Lane 2',
                path: '2',
                Icon: PresentationChartLineIcon
            },
            {
                title: 'Lane 3',
                path: '3',
                Icon: PresentationChartLineIcon
            }
        ]
    },
    {
        title: 'Configuration',
        path: '/config',
        Icon: CogIcon
    }
]