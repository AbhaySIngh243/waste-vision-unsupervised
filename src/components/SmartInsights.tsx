import { Lightbulb, Info, CheckCircle2, Volume2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClusterStat {
    label: string;
    percentage: number;
    color: string;
}

interface SmartInsightsProps {
    stats?: ClusterStat[];
}

export const SmartInsights = ({ stats }: SmartInsightsProps) => {
    if (!stats || stats.length === 0) return null;

    // Find dominant cluster
    const dominant = stats.reduce((prev, current) =>
        (prev.percentage > current.percentage) ? prev : current
    );

    // Fake Carbon Calculation (just for demo)
    const carbonSaved = (dominant.percentage * 0.12).toFixed(2);

    const speakInsights = () => {
        if ('speechSynthesis' in window) {
            const text = `Smart Insights Analysis. The dominant material detected is ${dominant.label}, covering ${dominant.percentage} percent of the area. By recycling this volume, you could save approximately ${carbonSaved} kilograms of CO2. Recommended action: Rinse containers and segregate from organic waste.`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <Lightbulb className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Smart Insights</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={speakInsights}
                    className="text-muted-foreground hover:text-primary gap-2"
                    title="Listen to insights"
                >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Listen</span>
                </Button>
            </div>

            <div className="grid gap-4">
                {/* Dominant Material Insight */}
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-foreground mb-1">
                                Dominant Material Detected
                            </p>
                            <p className="text-muted-foreground text-sm">
                                The analysis indicates a segregation density of <span className="text-primary font-semibold">{dominant.percentage}%</span> for {dominant.label}.
                                Ensure this category is separated from organic waste.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Carbon Impact (New Feature) */}
                <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-4 border border-green-500/20">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-green-500/20 rounded-full text-green-500">
                            <Leaf className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Environmental Impact</p>
                            <p className="text-sm text-muted-foreground">
                                Potential CO₂ Savings: <span className="font-bold text-green-500">{carbonSaved} kg</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actionable Tips */}
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                    <p className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Recommended Actions
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></span>
                            Rinse any containers in the {dominant.label} group to prevent contamination.
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></span>
                            Check local guidelines for specific disposal methods.
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></span>
                            Consider compacting to save space in collection bins.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
