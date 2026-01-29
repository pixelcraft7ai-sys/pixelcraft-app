import { Lock, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface StrictCodeProtectionProps {
  isSubscribed: boolean;
  canDownload: boolean;
  onUpgradeClick?: () => void;
}

export function StrictCodeProtection({
  isSubscribed,
  canDownload,
  onUpgradeClick,
}: StrictCodeProtectionProps) {
  const { t } = useTranslation();

  // If user is subscribed, don't show protection
  if (isSubscribed && canDownload) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600/20 blur-xl rounded-full"></div>
            <Lock className="w-16 h-16 text-purple-500 relative" />
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {t('editor.codeAccessRestricted')}
          </h2>
          <p className="text-gray-400">
            {t('editor.upgradeToPersonal')}
          </p>
        </div>

        {/* Features List */}
        <Card className="bg-slate-800/50 border-purple-500/20 p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            {t('pricing.features')}
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              </div>
              <span className="text-sm text-gray-300">
                {t('editor.unlockCodeAccess')}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              </div>
              <span className="text-sm text-gray-300">
                {t('pricing.download')}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              </div>
              <span className="text-sm text-gray-300">
                {t('editor.copyCode')}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              </div>
              <span className="text-sm text-gray-300">
                {t('pricing.collaboration')}
              </span>
            </li>
          </ul>
        </Card>

        {/* Pricing Info */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-slate-800/50 border-blue-500/20 p-4 text-center hover:border-blue-500/50 transition">
            <p className="text-xs text-gray-400 mb-1">{t('pricing.personal')}</p>
            <p className="text-lg font-bold text-white">$29</p>
            <p className="text-xs text-gray-500">{t('pricing.perMonth')}</p>
          </Card>
          <Card className="bg-slate-800/50 border-purple-500/20 p-4 text-center hover:border-purple-500/50 transition">
            <p className="text-xs text-gray-400 mb-1">{t('pricing.team')}</p>
            <p className="text-lg font-bold text-white">$99</p>
            <p className="text-xs text-gray-500">{t('pricing.perMonth')}</p>
          </Card>
        </div>

        {/* Upgrade Button */}
        <Button
          onClick={onUpgradeClick}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {t('pricing.upgrade')}
        </Button>

        {/* Free Plan Info */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 text-center">
            {t('editor.freeUserWarning')}
          </p>
        </div>
      </div>
    </div>
  );
}
