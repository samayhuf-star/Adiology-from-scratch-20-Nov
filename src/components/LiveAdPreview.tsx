import React from 'react';
import { Phone, MapPin, Link2, DollarSign, Smartphone, MessageSquare, Building2, FileText, Tag, Image as ImageIcon } from 'lucide-react';
import { Badge } from './ui/badge';

interface Extension {
    extensionType: string;
    [key: string]: any;
}

interface Ad {
    id: number;
    type: 'rsa' | 'dki' | 'callonly';
    headline1?: string;
    headline2?: string;
    headline3?: string;
    headline4?: string;
    headline5?: string;
    description1?: string;
    description2?: string;
    finalUrl?: string;
    path1?: string;
    path2?: string;
    phone?: string;
    businessName?: string;
    extensions?: Extension[];
    [key: string]: any;
}

interface LiveAdPreviewProps {
    ad: Ad;
    className?: string;
}

export const LiveAdPreview: React.FC<LiveAdPreviewProps> = ({ ad, className = '' }) => {
    const displayUrl = ad.finalUrl 
        ? `${ad.finalUrl.replace(/^https?:\/\//, '').split('/')[0]}${ad.path1 ? '/' + ad.path1 : ''}${ad.path2 ? '/' + ad.path2 : ''}`
        : 'example.com';

    const renderExtension = (ext: Extension, idx: number) => {
        switch (ext.extensionType) {
            case 'callout':
                return Array.isArray(ext.callouts) && ext.callouts.length > 0 ? (
                    <div key={idx} className="flex flex-wrap gap-1.5 mt-2">
                        {ext.callouts.slice(0, 4).map((callout: string, cIdx: number) => (
                            <span key={cIdx} className="text-xs text-slate-600 px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                                {callout}
                            </span>
                        ))}
                    </div>
                ) : null;

            case 'snippet':
                return (
                    <div key={idx} className="text-xs text-slate-600 mt-2">
                        <span className="font-semibold text-slate-700">{ext.header}:</span>{' '}
                        {Array.isArray(ext.values) ? ext.values.slice(0, 3).join(', ') : ''}
                    </div>
                );

            case 'sitelink':
                return Array.isArray(ext.sitelinks) && ext.sitelinks.length > 0 ? (
                    <div key={idx} className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200">
                        {ext.sitelinks.slice(0, 4).map((sitelink: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-start gap-1.5">
                                <Link2 className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                                        {sitelink.text || 'Link'}
                                    </div>
                                    {sitelink.description && (
                                        <div className="text-xs text-slate-500 line-clamp-1">{sitelink.description}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null;

            case 'call':
                return ext.phone ? (
                    <div key={idx} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                        <Phone className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">{ext.phone}</span>
                        {ext.callTrackingEnabled && (
                            <Badge variant="outline" className="text-xs h-5">Call Tracking</Badge>
                        )}
                    </div>
                ) : null;

            case 'location':
                return ext.businessName ? (
                    <div key={idx} className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs font-semibold text-slate-700">{ext.businessName}</span>
                        </div>
                        {(ext.addressLine1 || ext.city) && (
                            <div className="text-xs text-slate-600 ml-5 mt-0.5">
                                {[ext.addressLine1, ext.city, ext.state, ext.postalCode].filter(Boolean).join(', ')}
                            </div>
                        )}
                        {ext.phone && (
                            <div className="text-xs text-slate-600 ml-5 mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {ext.phone}
                            </div>
                        )}
                    </div>
                ) : null;

            case 'price':
                return ext.price ? (
                    <div key={idx} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                        <DollarSign className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs font-semibold text-slate-700">
                            {ext.priceQualifier && `${ext.priceQualifier} `}
                            {ext.price} {ext.unit || ''}
                        </span>
                        {ext.description && (
                            <span className="text-xs text-slate-600">- {ext.description}</span>
                        )}
                    </div>
                ) : null;

            case 'message':
                return ext.messageText ? (
                    <div key={idx} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <div>
                            <div className="text-xs font-semibold text-slate-700">{ext.messageText}</div>
                            <div className="text-xs text-slate-600">{ext.businessName || 'Business'} • {ext.phone || '(555) 123-4567'}</div>
                        </div>
                    </div>
                ) : null;

            case 'leadform':
                return (
                    <div key={idx} className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-start gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold text-slate-700">{ext.formName || 'Get Started'}</div>
                                {ext.formDescription && (
                                    <div className="text-xs text-slate-600 mt-0.5">{ext.formDescription}</div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'promotion':
                return ext.promotionText ? (
                    <div key={idx} className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-orange-600" />
                            <span className="text-xs font-semibold text-slate-700">{ext.promotionText}</span>
                            {ext.promotionDescription && (
                                <span className="text-xs text-slate-600">- {ext.promotionDescription}</span>
                            )}
                        </div>
                        {ext.startDate && ext.endDate && (
                            <div className="text-xs text-slate-600 ml-5 mt-0.5">
                                {new Date(ext.startDate).toLocaleDateString()} - {new Date(ext.endDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ) : null;

            case 'image':
                return ext.imageUrl ? (
                    <div key={idx} className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                            <div>
                                <div className="text-xs font-semibold text-slate-700">{ext.imageName || 'Image'}</div>
                                {ext.imageAltText && (
                                    <div className="text-xs text-slate-600 mt-0.5">{ext.imageAltText}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null;

            default:
                return null;
        }
    };

    return (
        <div className={`bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${className}`}>
            {/* Google Ads Style Preview */}
            <div className="space-y-2">
                {/* Headlines */}
                {(ad.type === 'rsa' || ad.type === 'dki') && (
                    <>
                        <div className="flex flex-wrap gap-1.5">
                            {ad.headline1 && (
                                <span className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                                    {ad.headline1}
                                </span>
                            )}
                            {ad.headline2 && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                                        {ad.headline2}
                                    </span>
                                </>
                            )}
                            {ad.headline3 && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                                        {ad.headline3}
                                    </span>
                                </>
                            )}
                            {ad.headline4 && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                                        {ad.headline4}
                                    </span>
                                </>
                            )}
                            {ad.headline5 && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-sm font-semibold text-blue-600 hover:underline cursor-pointer">
                                        {ad.headline5}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Display URL */}
                        <div className="text-xs text-green-700 font-medium">
                            {displayUrl}
                        </div>

                        {/* Descriptions */}
                        {ad.description1 && (
                            <div className="text-xs text-slate-600 leading-relaxed">
                                {ad.description1}
                            </div>
                        )}
                        {ad.description2 && (
                            <div className="text-xs text-slate-600 leading-relaxed">
                                {ad.description2}
                            </div>
                        )}
                    </>
                )}

                {/* Call Only Ad */}
                {ad.type === 'callonly' && (
                    <>
                        <div className="text-sm font-semibold text-blue-600">
                            {ad.headline1}
                        </div>
                        {ad.headline2 && (
                            <div className="text-xs text-slate-700">
                                {ad.headline2}
                            </div>
                        )}
                        {ad.description1 && (
                            <div className="text-xs text-slate-600 leading-relaxed">
                                {ad.description1}
                            </div>
                        )}
                        {ad.description2 && (
                            <div className="text-xs text-slate-600 leading-relaxed">
                                {ad.description2}
                            </div>
                        )}
                        {(ad.phone || ad.businessName) && (
                            <div className="text-xs text-green-700 font-semibold flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {ad.phone} {ad.businessName && `• ${ad.businessName}`}
                            </div>
                        )}
                    </>
                )}

                {/* Extensions */}
                {ad.extensions && ad.extensions.length > 0 && (
                    <div className="mt-3 pt-3 border-t-2 border-slate-300">
                        {ad.extensions.map((ext, idx) => renderExtension(ext, idx))}
                    </div>
                )}
            </div>
        </div>
    );
};

