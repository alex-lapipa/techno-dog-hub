import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Disc3, Wrench, Radio, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getArtistById, artists } from "@/data/artists";
import { getReleasesByArtist } from "@/data/releases";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Artist images
import jeffMillsImg from "@/assets/artists/jeff-mills.jpg";
import robertHoodImg from "@/assets/artists/robert-hood.jpg";
import undergroundResistanceImg from "@/assets/artists/underground-resistance.jpg";
import surgeonImg from "@/assets/artists/surgeon.jpg";
import helenaHauffImg from "@/assets/artists/helena-hauff.jpg";
import marcelDettmannImg from "@/assets/artists/marcel-dettmann.jpg";
import benKlockImg from "@/assets/artists/ben-klock.jpg";
import regisImg from "@/assets/artists/regis.jpg";
import rodhadImg from "@/assets/artists/rodhad.jpg";
import nineninenineImg from "@/assets/artists/999999999.jpg";
import menImg from "@/assets/artists/men.jpg";
import oscarMuleroImg from "@/assets/artists/oscar-mulero.jpg";
import djNobuImg from "@/assets/artists/dj-nobu.jpg";
import percImg from "@/assets/artists/perc.jpg";
import kwartzImg from "@/assets/artists/kwartz.jpg";
import ancientMethodsImg from "@/assets/artists/ancient-methods.jpg";
import karennImg from "@/assets/artists/karenn.jpg";
import blawanImg from "@/assets/artists/blawan.jpg";
import vtssImg from "@/assets/artists/vtss.jpg";
import spfdjImg from "@/assets/artists/spfdj.jpg";
import anethaImg from "@/assets/artists/anetha.jpg";
import iHateModelsImg from "@/assets/artists/i-hate-models.jpg";
import rroseImg from "@/assets/artists/rrose.jpg";
import donatoDozzyImg from "@/assets/artists/donato-dozzy.jpg";
import reekoImg from "@/assets/artists/reeko.jpg";
import exiumImg from "@/assets/artists/exium.jpg";
import eulogioImg from "@/assets/artists/eulogio.jpg";
import daxJImg from "@/assets/artists/dax-j.jpg";
import wataIgarashiImg from "@/assets/artists/wata-igarashi.jpg";
import dashaRushImg from "@/assets/artists/dasha-rush.jpg";
import planetaryAssaultSystemsImg from "@/assets/artists/planetary-assault-systems.jpg";
import paulaTempleImg from "@/assets/artists/paula-temple.jpg";
import rebekahImg from "@/assets/artists/rebekah.jpg";
import manniDeeImg from "@/assets/artists/manni-dee.jpg";
import setaocMassImg from "@/assets/artists/setaoc-mass.jpg";
import vrilImg from "@/assets/artists/vril.jpg";
import phaseFataleImg from "@/assets/artists/phase-fatale.jpg";
import hectorOaksImg from "@/assets/artists/hector-oaks.jpg";
import jamesRuskinImg from "@/assets/artists/james-ruskin.jpg";
import dDanImg from "@/assets/artists/d-dan.jpg";
import dimiAngelisImg from "@/assets/artists/dimi-angelis.jpg";
import jeroenSearchImg from "@/assets/artists/jeroen-search.jpg";
import tensalImg from "@/assets/artists/tensal.jpg";
import kikePravdaImg from "@/assets/artists/kike-pravda.jpg";
import psykImg from "@/assets/artists/psyk.jpg";
import hadoneImg from "@/assets/artists/hadone.jpg";
import nicoMorenoImg from "@/assets/artists/nico-moreno.jpg";
import trymImg from "@/assets/artists/trym.jpg";
import onyvaaImg from "@/assets/artists/onyvaa.jpg";
import neelImg from "@/assets/artists/neel.jpg";
import boston168Img from "@/assets/artists/boston-168.jpg";
import yanCookImg from "@/assets/artists/yan-cook.jpg";
import rikhterImg from "@/assets/artists/rikhter.jpg";
import lewisFautziImg from "@/assets/artists/lewis-fautzi.jpg";
import adrianaLopezImg from "@/assets/artists/adriana-lopez.jpg";
import shdwObscureShapeImg from "@/assets/artists/shdw-obscure-shape.jpg";

// Image map
const artistImages: Record<string, string> = {
  "jeff-mills": jeffMillsImg,
  "robert-hood": robertHoodImg,
  "underground-resistance": undergroundResistanceImg,
  "surgeon": surgeonImg,
  "helena-hauff": helenaHauffImg,
  "marcel-dettmann": marcelDettmannImg,
  "ben-klock": benKlockImg,
  "regis": regisImg,
  "rodhad": rodhadImg,
  "999999999": nineninenineImg,
  "men": menImg,
  "oscar-mulero": oscarMuleroImg,
  "dj-nobu": djNobuImg,
  "perc": percImg,
  "kwartz": kwartzImg,
  "ancient-methods": ancientMethodsImg,
  "karenn": karennImg,
  "blawan": blawanImg,
  "vtss": vtssImg,
  "spfdj": spfdjImg,
  "anetha": anethaImg,
  "i-hate-models": iHateModelsImg,
  "rrose": rroseImg,
  "donato-dozzy": donatoDozzyImg,
  "reeko": reekoImg,
  "exium": exiumImg,
  "eulogio": eulogioImg,
  "dax-j": daxJImg,
  "wata-igarashi": wataIgarashiImg,
  "dasha-rush": dashaRushImg,
  "planetary-assault-systems": planetaryAssaultSystemsImg,
  "paula-temple": paulaTempleImg,
  "rebekah": rebekahImg,
  "manni-dee": manniDeeImg,
  "setaoc-mass": setaocMassImg,
  "vril": vrilImg,
  "phase-fatale": phaseFataleImg,
  "hector-oaks": hectorOaksImg,
  "james-ruskin": jamesRuskinImg,
  "d-dan": dDanImg,
  "dimi-angelis": dimiAngelisImg,
  "jeroen-search": jeroenSearchImg,
  "tensal": tensalImg,
  "kike-pravda": kikePravdaImg,
  "psyk": psykImg,
  "hadone": hadoneImg,
  "nico-moreno": nicoMorenoImg,
  "trym": trymImg,
  "onyvaa": onyvaaImg,
  "neel": neelImg,
  "boston-168": boston168Img,
  "yan-cook": yanCookImg,
  "rikhter": rikhterImg,
  "lewis-fautzi": lewisFautziImg,
  "adriana-lopez": adrianaLopezImg,
  "shdw-obscure-shape": shdwObscureShapeImg,
};

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const artist = id ? getArtistById(id) : null;
  const artistReleases = id ? getReleasesByArtist(id) : [];

  // Get image for artist
  const getArtistImage = (artistId: string) => {
    return artistImages[artistId] || artistImages["jeff-mills"]; // fallback
  };

  if (!artist) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-8">
            <p className="font-mono text-muted-foreground">
              {language === 'en' ? 'Artist not found' : 'Artista no encontrado'}
            </p>
            <Link to="/artists" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
              ← {language === 'en' ? 'Back to Artists' : 'Volver a Artistas'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get related artists (same region or shared tags)
  const relatedArtists = artists
    .filter(a => 
      a.id !== artist.id && 
      (a.region === artist.region || a.tags.some(t => artist.tags.includes(t)))
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <Link 
            to="/artists" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {language === 'en' ? 'Back to Artists' : 'Volver a Artistas'}
          </Link>

          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Artist Photo */}
            <div className="aspect-square relative overflow-hidden border border-border">
              <img 
                src={getArtistImage(artist.id)}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex flex-wrap gap-2">
                  {artist.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/artists?tag=${tag}`}
                      className="font-mono text-xs bg-background/90 border border-border px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
              {/* Artistic representation notice */}
              <div className="absolute top-2 right-2">
                <span className="font-mono text-[10px] bg-background/80 text-muted-foreground px-2 py-1 border border-border/50">
                  {language === 'en' ? 'Artistic representation' : 'Representación artística'}
                </span>
              </div>
            </div>

            {/* Artist Info */}
            <div className="space-y-6">
              <div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
                  // {artist.region}
                </div>
                <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight mb-2 hover:animate-glitch">
                  {artist.name}
                </h1>
                {artist.realName && (
                  <p className="font-mono text-sm text-muted-foreground">
                    {artist.realName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {artist.city}, {artist.country}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {artist.active}
                </div>
              </div>

              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                {artist.bio}
              </p>

              {artist.labels && artist.labels.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Labels' : 'Sellos'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {artist.labels.map(label => (
                      <Link
                        key={label}
                        to={`/labels?search=${label}`}
                        className="font-mono text-xs border border-border px-3 py-1.5 hover:bg-card transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {artist.collaborators && artist.collaborators.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Collaborators' : 'Colaboradores'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {artist.collaborators.map(collab => (
                      <span
                        key={collab}
                        className="font-mono text-xs border border-border px-3 py-1.5"
                      >
                        {collab}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Career Highlights */}
          {artist.careerHighlights && artist.careerHighlights.length > 0 && (
            <section className="mb-12 border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6">
                {language === 'en' ? 'Career Highlights' : 'Momentos Destacados'}
              </h2>
              <ul className="space-y-3">
                {artist.careerHighlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3 font-mono text-sm">
                    <span className="text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Key Releases */}
          {artist.keyReleases && artist.keyReleases.length > 0 && (
            <section className="mb-12 border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
                <Disc3 className="w-5 h-5" />
                {language === 'en' ? 'Key Releases' : 'Lanzamientos Clave'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {artist.keyReleases.map((release, i) => (
                  <div 
                    key={i} 
                    className="border border-border p-4 hover:bg-card transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-mono text-sm uppercase group-hover:animate-glitch">
                        {release.title}
                      </h3>
                      <span className="font-mono text-xs text-muted-foreground">
                        {release.year}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-muted-foreground">
                        {release.label}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                        {release.format}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gear & Rider */}
          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
              <Wrench className="w-5 h-5" />
              {language === 'en' ? 'Gear & Rider' : 'Equipo y Rider'}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Studio Gear */}
              {artist.studioGear && artist.studioGear.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    {language === 'en' ? 'Studio' : 'Estudio'}
                  </h3>
                  <ul className="space-y-2">
                    {artist.studioGear.map((gear, i) => (
                      <li key={i} className="font-mono text-xs text-muted-foreground">
                        → {gear}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Setup */}
              {artist.liveSetup && artist.liveSetup.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    {language === 'en' ? 'Live Setup' : 'Setup Live'}
                  </h3>
                  <ul className="space-y-2">
                    {artist.liveSetup.map((gear, i) => (
                      <li key={i} className="font-mono text-xs text-muted-foreground">
                        → {gear}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* DJ Setup */}
              {artist.djSetup && artist.djSetup.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    {language === 'en' ? 'DJ Setup' : 'Setup DJ'}
                  </h3>
                  <ul className="space-y-2">
                    {artist.djSetup.map((gear, i) => (
                      <li key={i} className="font-mono text-xs text-muted-foreground">
                        → {gear}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rider Notes */}
            {artist.riderNotes && (
              <div className="mt-4 border border-border p-4 bg-card/50">
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {language === 'en' ? 'Rider Notes' : 'Notas del Rider'}
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  {artist.riderNotes}
                </p>
              </div>
            )}
          </section>

          {/* Related Artists */}
          {relatedArtists.length > 0 && (
            <section className="border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6">
                {language === 'en' ? 'Related Artists' : 'Artistas Relacionados'}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedArtists.map(related => (
                  <Link
                    key={related.id}
                    to={`/artists/${related.id}`}
                    className="border border-border p-4 hover:bg-card transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-mono text-sm uppercase group-hover:animate-glitch">
                        {related.name}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {related.city}, {related.country}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {related.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-1.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Deep Links */}
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {language === 'en' ? 'Explore More' : 'Explorar Más'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link 
                to={`/releases?artist=${artist.id}`}
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
                → {language === 'en' ? 'Releases' : 'Lanzamientos'}
              </Link>
              <Link 
                to={`/artists?region=${artist.region}`}
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
                → {artist.region} {language === 'en' ? 'Artists' : 'Artistas'}
              </Link>
              {artist.labels && artist.labels[0] && (
                <Link 
                  to={`/labels?search=${artist.labels[0]}`}
                  className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
                >
                  → {artist.labels[0]}
                </Link>
              )}
              <Link 
                to="/mad/timeline"
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
                → {language === 'en' ? 'Timeline' : 'Línea temporal'}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDetail;
