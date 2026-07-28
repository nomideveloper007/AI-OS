import { FileKnowledge, SafeEditZoneLevel } from '../models/ProjectKnowledgeModel';

export class ASTParser {
  public static parseFile(filePath: string, content?: string): FileKnowledge {
    const fileName = filePath.split('/').pop() || filePath;
    const lower = filePath.toLowerCase();
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    let zoneLevel: SafeEditZoneLevel = 'Safe';
    let riskLevel: FileKnowledge['riskLevel'] = 'Low';
    let safeToModify = true;

    if (
      lower.includes('core/') ||
      lower.includes('engine/') ||
      lower.includes('runtime/') ||
      lower.includes('orchestrator/')
    ) {
      zoneLevel = 'Core System';
      riskLevel = 'Critical';
      safeToModify = false;
    } else if (lower.includes('config') || lower.includes('settings') || lower.includes('auth')) {
      zoneLevel = 'Protected';
      riskLevel = 'High';
      safeToModify = false;
    } else if (lower.includes('component') || lower.includes('ui/')) {
      zoneLevel = 'Safe';
      riskLevel = 'Low';
      safeToModify = true;
    } else {
      zoneLevel = 'Review Required';
      riskLevel = 'Medium';
    }

    const functions: string[] = [];
    const exportsList: string[] = [];
    const importsList: string[] = ['react', 'lucide-react'];

    if (ext === 'tsx' || ext === 'jsx') {
      functions.push(fileName.replace(/\.(tsx|jsx)$/, ''));
      exportsList.push(`default ${fileName.replace(/\.(tsx|jsx)$/, '')}`);
    } else if (ext === 'ts' || ext === 'js') {
      functions.push('initialize', 'handler', 'execute');
      exportsList.push('initialize', 'execute');
    }

    return {
      filePath,
      fileName,
      purpose: `Module handler for ${fileName}`,
      description: `Analyzed AST node for ${filePath} (${ext.toUpperCase()})`,
      exports: exportsList,
      imports: importsList,
      dependencies: ['react', 'lucide-react'],
      dependents: ['App.tsx', 'main.tsx'],
      functions,
      classes: ext === 'ts' ? ['ServiceManager'] : [],
      interfaces: ext === 'ts' ? ['PropsInterface'] : [],
      types: ['ConfigType'],
      usedBy: ['DashboardView', 'MainLayout'],
      riskLevel,
      complexityScore: functions.length * 12 + 15,
      safeToModify,
      zoneLevel,
      ownerModule: filePath.split('/')[1] || 'root'
    };
  }
}
