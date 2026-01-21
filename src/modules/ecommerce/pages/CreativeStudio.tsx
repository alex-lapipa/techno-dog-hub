/**
 * techno.dog E-commerce Module - Creative Studio
 * 
 * Empty shell page ready for future development.
 */

import { Palette } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

export function CreativeStudio() {
  return (
    <AdminPageLayout
      title="Creative Studio"
      description="Design and content creation tools"
      icon={Palette}
      iconColor="text-crimson"
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
      <Card className="p-12 bg-card border-border border-dashed">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Palette className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
            Creative Studio
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This module is prepared for future design and content creation features. 
            Customize this space according to your creative needs.
          </p>
          <span className="mt-4 inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-wider bg-crimson/10 text-crimson rounded">
            Ready for Development
          </span>
        </div>
      </Card>
    </AdminPageLayout>
  );
}

export default CreativeStudio;
