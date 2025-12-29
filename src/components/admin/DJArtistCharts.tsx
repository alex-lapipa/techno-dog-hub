import { useMemo } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DJArtist {
  id: number;
  artist_name: string;
  nationality: string | null;
  subgenres: string[] | null;
  labels: string[] | null;
  rank: number;
}

interface DJArtistChartsProps {
  artists: DJArtist[];
}

// Design system colors from index.css
const chartColors = [
  'hsl(0 0% 100%)',           // white
  'hsl(348 75% 52%)',         // crimson
  'hsl(100 100% 60%)',        // logo green
  'hsl(0 0% 60%)',            // muted foreground
  'hsl(0 0% 40%)',            // darker gray
  'hsl(180 100% 50%)',        // glitch-1 cyan
  'hsl(320 100% 60%)',        // glitch-2 magenta
  'hsl(0 0% 80%)',            // light gray
  'hsl(348 75% 35%)',         // dark crimson
  'hsl(100 100% 40%)',        // dark green
];

// Parse country from nationality string
const parseCountry = (nationality: string | null): string => {
  if (!nationality) return 'Unknown';
  
  const countryMap: Record<string, string> = {
    'british': 'UK',
    'german': 'Germany',
    'american': 'USA',
    'spanish': 'Spain',
    'dutch': 'Netherlands',
    'belgian': 'Belgium',
    'italian': 'Italy',
    'french': 'France',
    'scottish': 'UK',
    'irish': 'Ireland',
    'swedish': 'Sweden',
    'georgian': 'Georgia',
    'detroit': 'USA',
    'berlin': 'Germany',
    'japanese': 'Japan',
    'polish': 'Poland',
    'colombian': 'Colombia',
    'argentinian': 'Argentina',
    'australian': 'Australia',
  };
  
  const lower = nationality.toLowerCase();
  for (const [key, value] of Object.entries(countryMap)) {
    if (lower.includes(key)) return value;
  }
  
  return nationality.split(/[,(]/)[0].trim();
};

export const DJArtistCharts = ({ artists }: DJArtistChartsProps) => {
  // Country distribution
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    artists.forEach(a => {
      const country = parseCountry(a.nationality);
      counts[country] = (counts[country] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, value], i) => ({
        id,
        label: id,
        value,
        color: chartColors[i % chartColors.length],
      }));
  }, [artists]);

  // Subgenre distribution
  const subgenreData = useMemo(() => {
    const counts: Record<string, number> = {};
    artists.forEach(a => {
      (a.subgenres || []).forEach(sg => {
        const genre = sg.toLowerCase().trim();
        counts[genre] = (counts[genre] || 0) + 1;
      });
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([genre, count]) => ({
        genre: genre.length > 15 ? genre.slice(0, 15) + '...' : genre,
        count,
      }));
  }, [artists]);

  // Labels distribution (top labels)
  const labelData = useMemo(() => {
    const counts: Record<string, number> = {};
    artists.forEach(a => {
      (a.labels || []).forEach(label => {
        const clean = label.replace(/\s*\(.*?\)\s*/g, '').trim();
        if (clean) counts[clean] = (counts[clean] || 0) + 1;
      });
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, value], i) => ({
        id,
        label: id,
        value,
        color: chartColors[i % chartColors.length],
      }));
  }, [artists]);

  // Rank distribution (by decade bands)
  const rankData = useMemo(() => {
    const bands = [
      { label: 'Top 10', min: 1, max: 10, count: 0 },
      { label: '11-25', min: 11, max: 25, count: 0 },
      { label: '26-50', min: 26, max: 50, count: 0 },
      { label: '51-75', min: 51, max: 75, count: 0 },
      { label: '76-100', min: 76, max: 100, count: 0 },
    ];
    
    artists.forEach(a => {
      const band = bands.find(b => a.rank >= b.min && a.rank <= b.max);
      if (band) band.count++;
    });
    
    return bands.map(b => ({ rank: b.label, count: b.count }));
  }, [artists]);

  const nivoTheme = {
    background: 'transparent',
    text: {
      fontSize: 11,
      fill: 'hsl(0 0% 60%)',
      fontFamily: 'IBM Plex Mono, monospace',
    },
    axis: {
      ticks: {
        text: {
          fontSize: 10,
          fill: 'hsl(0 0% 60%)',
          fontFamily: 'IBM Plex Mono, monospace',
        },
      },
      legend: {
        text: {
          fontSize: 11,
          fill: 'hsl(0 0% 80%)',
          fontFamily: 'IBM Plex Mono, monospace',
          textTransform: 'uppercase' as const,
        },
      },
    },
    grid: {
      line: {
        stroke: 'hsl(0 0% 20%)',
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fontSize: 10,
        fill: 'hsl(0 0% 80%)',
        fontFamily: 'IBM Plex Mono, monospace',
      },
    },
    tooltip: {
      container: {
        background: 'hsl(0 0% 5%)',
        color: 'hsl(0 0% 100%)',
        fontSize: 11,
        fontFamily: 'IBM Plex Mono, monospace',
        border: '1px solid hsl(0 0% 20%)',
        borderRadius: 0,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Country Distribution - Pie */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm uppercase tracking-wider">
            By Country
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsivePie
              data={countryData}
              theme={nivoTheme}
              margin={{ top: 20, right: 80, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={0}
              activeOuterRadiusOffset={8}
              colors={chartColors}
              borderWidth={1}
              borderColor="hsl(0 0% 20%)"
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="hsl(0 0% 80%)"
              arcLinkLabelsThickness={1}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={15}
              arcLabelsTextColor="hsl(0 0% 0%)"
              legends={[
                {
                  anchor: 'right',
                  direction: 'column',
                  justify: false,
                  translateX: 70,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 60,
                  itemHeight: 18,
                  itemTextColor: 'hsl(0 0% 60%)',
                  symbolSize: 10,
                  symbolShape: 'square',
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subgenre Distribution - Bar */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm uppercase tracking-wider">
            Subgenres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveBar
              data={subgenreData}
              keys={['count']}
              indexBy="genre"
              theme={nivoTheme}
              margin={{ top: 10, right: 20, bottom: 80, left: 50 }}
              padding={0.3}
              colors={['hsl(348 75% 52%)']}
              borderColor="hsl(0 0% 20%)"
              borderWidth={1}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="hsl(0 0% 100%)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Labels Distribution - Pie */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm uppercase tracking-wider">
            Top Labels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsivePie
              data={labelData}
              theme={nivoTheme}
              margin={{ top: 20, right: 100, bottom: 20, left: 20 }}
              innerRadius={0.6}
              padAngle={0.5}
              cornerRadius={0}
              activeOuterRadiusOffset={8}
              colors={chartColors}
              borderWidth={1}
              borderColor="hsl(0 0% 20%)"
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={20}
              arcLabelsTextColor="hsl(0 0% 0%)"
              legends={[
                {
                  anchor: 'right',
                  direction: 'column',
                  justify: false,
                  translateX: 90,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 80,
                  itemHeight: 16,
                  itemTextColor: 'hsl(0 0% 60%)',
                  symbolSize: 8,
                  symbolShape: 'square',
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rank Distribution - Bar */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm uppercase tracking-wider">
            Rank Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveBar
              data={rankData}
              keys={['count']}
              indexBy="rank"
              theme={nivoTheme}
              margin={{ top: 10, right: 20, bottom: 50, left: 50 }}
              padding={0.4}
              colors={['hsl(100 100% 60%)']}
              borderColor="hsl(0 0% 20%)"
              borderWidth={1}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Rank Bands',
                legendPosition: 'middle',
                legendOffset: 40,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Artists',
                legendPosition: 'middle',
                legendOffset: -40,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="hsl(0 0% 0%)"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DJArtistCharts;
