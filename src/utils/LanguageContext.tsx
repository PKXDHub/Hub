import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    // Header
    nav_hub: "Voltar à Central",
    nav_applications: "Inscrições 📝",
    nav_admin_open: "Modo Admin",
    nav_admin_close: "Fechar Painel",
    nav_notifications: "Central de Notificações",
    sub_title: "Notícias, Spoilers e Códigos!",
    partner_badge: "Parceiro Fã Clube Oficial",
    
    // Hero
    hero_headline_1: "O Universo de",
    hero_headline_2: "PK XD em Suas Mãos!",
    hero_subheadline: "Fique por dentro de todas as novidades, segredos, códigos ativos e spoilers vazados em primeira mão do seu jogo favorito!",
    
    // Tabs
    tab_news: "Notícias",
    tab_spoilers: "Spoilers",
    tab_codes: "Códigos",
    tab_theories: "Teorias",
    tab_videos: "Vídeos",
    tab_shorts: "Shorts",
    tab_missions: "Missões",
    tab_community: "Comunidade",
    tab_polls: "Enquetes 📊",
    
    // Countdown & Spoilers
    countdown_active: "Contagem Regressiva",
    spoiler_released: "NOVIDADE LIBERADA!",
    spoiler_blur: "Clique para revelar o spoiler!",
    days: "dias",
    hours: "horas",
    minutes: "minutos",
    seconds: "segundos",
    
    // Comments
    comments_title: "Comentários dos Fãs",
    comments_placeholder: "Escreva seu comentário...",
    comments_send: "Enviar",
    comments_no_auth: "Você precisa fazer login para comentar!",
    
    // Polls
    polls_title: "Enquetes da Comunidade",
    polls_active: "Enquete Ativa",
    polls_vote_btn: "Votar",
    polls_already_voted: "Você já votou nesta enquete!",
    polls_no_active: "Não há nenhuma enquete ativa no momento.",
    polls_total_votes: "votos no total",
    polls_create: "Criar Nova Enquete",
    polls_question_placeholder: "Qual a sua opinião sobre...?",
    polls_option_placeholder: "Opção",
    polls_add_option: "Adicionar Opção",
    polls_save: "Salvar e Publicar Enquete",
    polls_delete: "Deletar Enquete",
    polls_percentage: "de votos",
    polls_results: "Resultados Parciais",
    polls_vote_registered: "Voto registrado com sucesso! 🎉",
    polls_must_vote_option: "Por favor, selecione uma opção para votar!",
    
    // Admin Panel
    admin_panel_title: "Painel de Administração",
    admin_welcome: "Bem-vindo ao Painel de Controle",
  },
  en: {
    // Header
    nav_hub: "Back to Hub",
    nav_applications: "Applications 📝",
    nav_admin_open: "Admin Mode",
    nav_admin_close: "Close Panel",
    nav_notifications: "Notifications Center",
    sub_title: "News, Spoilers & Promo Codes!",
    partner_badge: "Official Fan Club Partner",
    
    // Hero
    hero_headline_1: "The Universe of",
    hero_headline_2: "PK XD in Your Hands!",
    hero_subheadline: "Stay on top of all the news, secrets, active codes and leaked spoilers first hand of your favorite game!",
    
    // Tabs
    tab_news: "News",
    tab_spoilers: "Spoilers",
    tab_codes: "Promo Codes",
    tab_theories: "Theories",
    tab_videos: "Videos",
    tab_shorts: "Shorts",
    tab_missions: "Missions",
    tab_community: "Community",
    tab_polls: "Polls 📊",
    
    // Countdown & Spoilers
    countdown_active: "Countdown Active",
    spoiler_released: "SPOILER RELEASED!",
    spoiler_blur: "Click to reveal the spoiler!",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds",
    
    // Comments
    comments_title: "Fan Comments",
    comments_placeholder: "Write your comment...",
    comments_send: "Send",
    comments_no_auth: "You need to log in to comment!",
    
    // Polls
    polls_title: "Community Polls",
    polls_active: "Active Poll",
    polls_vote_btn: "Vote",
    polls_already_voted: "You have already voted in this poll!",
    polls_no_active: "There are no active polls at the moment.",
    polls_total_votes: "total votes",
    polls_create: "Create New Poll",
    polls_question_placeholder: "What is your opinion about...?",
    polls_option_placeholder: "Option",
    polls_add_option: "Add Option",
    polls_save: "Save & Publish Poll",
    polls_delete: "Delete Poll",
    polls_percentage: "of votes",
    polls_results: "Partial Results",
    polls_vote_registered: "Vote successfully registered! 🎉",
    polls_must_vote_option: "Please select an option to vote!",
    
    // Admin Panel
    admin_panel_title: "Control Panel",
    admin_welcome: "Welcome to the Admin Control Panel",
  },
  es: {
    // Header
    nav_hub: "Volver a la Central",
    nav_applications: "Inscripciones 📝",
    nav_admin_open: "Modo Admin",
    nav_admin_close: "Cerrar Panel",
    nav_notifications: "Centro de Notificaciones",
    sub_title: "¡Noticias, Spoilers y Códigos!",
    partner_badge: "Socio Oficial de Club de Fans",
    
    // Hero
    hero_headline_1: "El Universo de",
    hero_headline_2: "¡PK XD en Tus Manos!",
    hero_subheadline: "¡Mantente al tanto de todas las novedades, secretos, códigos activos y spoilers filtrados de primera mano de tu juego favorito!",
    
    // Tabs
    tab_news: "Noticias",
    tab_spoilers: "Spoilers",
    tab_codes: "Códigos Promo",
    tab_theories: "Teorías",
    tab_videos: "Videos",
    tab_shorts: "Shorts",
    tab_missions: "Misiones",
    tab_community: "Comunidad",
    tab_polls: "Encuestas 📊",
    
    // Countdown & Spoilers
    countdown_active: "Cuenta Regresiva",
    spoiler_released: "¡SPOILER REVELADO!",
    spoiler_blur: "¡Haz clic para revelar el spoiler!",
    days: "días",
    hours: "horas",
    minutes: "minutos",
    seconds: "segundos",
    
    // Comments
    comments_title: "Comentarios de Fans",
    comments_placeholder: "Escribe tu comentario...",
    comments_send: "Enviar",
    comments_no_auth: "¡Necesitas iniciar sesión para comentar!",
    
    // Polls
    polls_title: "Encuestas de la Comunidad",
    polls_active: "Encuesta Activa",
    polls_vote_btn: "Votar",
    polls_already_voted: "¡Ya has votado en esta encuesta!",
    polls_no_active: "No hay encuestas activas en este momento.",
    polls_total_votes: "votos en total",
    polls_create: "Crear Nueva Encuesta",
    polls_question_placeholder: "¿Cuál es tu opinión sobre...?",
    polls_option_placeholder: "Opción",
    polls_add_option: "Añadir Opción",
    polls_save: "Guardar y Publicar Encuesta",
    polls_delete: "Eliminar Encuesta",
    polls_percentage: "de votos",
    polls_results: "Resultados Parciales",
    polls_vote_registered: "¡Voto registrado con éxito! 🎉",
    polls_must_vote_option: "¡Por favor, selecciona una opción para votar!",
    
    // Admin Panel
    admin_panel_title: "Panel de Control",
    admin_welcome: "Bienvenido al Panel de Control de Administración",
  }
};

type TranslationKey = keyof typeof translations.pt;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('pkxd_lang');
      if (saved === 'pt' || saved === 'en' || saved === 'es') {
        return saved;
      }
    } catch (e) {}
    return 'pt'; // PT-BR default official language
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('pkxd_lang', lang);
    } catch (e) {}
  };

  const t = (key: TranslationKey): string => {
    const translationSet = translations[language] || translations.pt;
    return translationSet[key] || translations.pt[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
