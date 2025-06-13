import { renderHook } from '@testing-library/react'
import { useChecklist } from './use-checklist'
import { BlockEnum } from '../types'

// mock i18n 相关，防止 i18n.use 报错
jest.mock('i18next', () => ({
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockReturnThis(),
}))
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
    initReactI18next: {},
}))
// mock ky
jest.mock('ky', () => ({
    __esModule: true,
    default: {
        create: jest.fn(),
    },
}))
jest.mock('../store', () => ({
    useStore: jest.fn(() => ({})),
}))
jest.mock('./use-nodes-data', () => ({
    useNodesExtraData: () => ({
        [BlockEnum.Code]: {
            checkValid: () => ({ errorMessage: '' }),
            checkVarValid: () => ({ errorMessage: [] }),
        },
    }),
}))
jest.mock('./use-workflow', () => ({
    useIsChatMode: () => true,
}))
jest.mock('@/context/i18n', () => ({
    useGetLanguage: () => 'zh',
}))
jest.mock('@/service/use-strategy', () => ({
    useStrategyProviders: () => ({ data: [] }),
}))
jest.mock('../datasets-detail-store/store', () => ({
    useDatasetsDetailStore: () => ({ datasetsDetail: {} }),
}))
jest.mock('@/context/app-context', () => ({
    useAppContext: () => ({
        currentWorkspace: { beta_config: { workflow_var_check: true } },
    }),
}))
jest.mock('../utils', () => ({
    getValidTreeNodes: () => ({ validNodes: [] }),
    transformStartNodeVariables: () => ({}),
    getToolCheckParams: jest.fn(),
}))
jest.mock('lodash-es/groupBy', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('useChecklist', () => {
    it('返回 warning 节点和缺 answer 节点', () => {
        const nodes = [
            {
                id: '1',
                type: 'custom',
                data: {
                    type: BlockEnum.Code,
                    title: '代码节点',
                },
            },
        ]
        const edges: any[] = []
        const { result } = renderHook(() => useChecklist(nodes as any, edges))
        expect(result.current).toEqual([
            {
                id: '1',
                type: 'code',
                title: '代码节点',
                unConnected: true,
                errorMessage: '',
                varErrorMessage: [],
            },
            {
                id: 'answer-need-added',
                type: 'answer',
                title: 'workflow.blocks.answer',
                errorMessage: 'workflow.common.needAnswerNode',
            },
        ])
    })
})
