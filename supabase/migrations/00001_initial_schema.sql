-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create tables
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    ring TEXT DEFAULT 'Rookie', -- Rookie, Pro, AllStar, MVP, HallOfFame
    correct_picks INTEGER DEFAULT 0,
    total_picks INTEGER DEFAULT 0,
    hit_rate FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.sports (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL, -- e.g., 'NBA', 'NFL', 'MLB', etc.
    display_name TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.teams (
    id SERIAL PRIMARY KEY,
    sport_id INTEGER REFERENCES public.sports(id) NOT NULL,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    logo_url TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sport_id, abbreviation)
);

CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sport_id INTEGER REFERENCES public.sports(id) NOT NULL,
    home_team_id INTEGER REFERENCES public.teams(id) NOT NULL,
    away_team_id INTEGER REFERENCES public.teams(id) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    lock_time TIMESTAMP WITH TIME ZONE NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, final
    winner_id INTEGER REFERENCES public.teams(id),
    external_id TEXT, -- ID from external data source
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    key_stat TEXT,
    key_storyline TEXT,
    key_prediction TEXT,
    sport_id INTEGER REFERENCES public.sports(id),
    game_id UUID REFERENCES public.games(id),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE public.picks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) NOT NULL,
    game_id UUID REFERENCES public.games(id) NOT NULL,
    pick_team_id INTEGER REFERENCES public.teams(id) NOT NULL,
    correct BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES public.users(id) NOT NULL,
    following_id UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) NOT NULL,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views
CREATE OR REPLACE VIEW public.v_leaderboard AS
SELECT
    u.id,
    u.username,
    u.avatar_url,
    u.ring,
    u.correct_picks,
    u.total_picks,
    u.hit_rate,
    COUNT(f.id) AS followers_count
FROM
    public.users u
LEFT JOIN
    public.follows f ON u.id = f.following_id
WHERE
    u.total_picks > 0
GROUP BY
    u.id
ORDER BY
    u.hit_rate DESC, u.total_picks DESC;

CREATE OR REPLACE VIEW public.v_friends_leaderboard AS
SELECT
    u.id,
    u.username,
    u.avatar_url,
    u.ring,
    u.correct_picks,
    u.total_picks,
    u.hit_rate,
    f.follower_id
FROM
    public.users u
JOIN
    public.follows f ON u.id = f.following_id
WHERE
    u.total_picks > 0
ORDER BY
    u.hit_rate DESC, u.total_picks DESC;

CREATE OR REPLACE VIEW public.v_today_games AS
SELECT
    g.*,
    ht.name AS home_team_name,
    ht.abbreviation AS home_team_abbr,
    ht.logo_url AS home_team_logo,
    at.name AS away_team_name,
    at.abbreviation AS away_team_abbr,
    at.logo_url AS away_team_logo,
    s.name AS sport_name,
    s.display_name AS sport_display_name,
    s.icon_url AS sport_icon
FROM
    public.games g
JOIN
    public.teams ht ON g.home_team_id = ht.id
JOIN
    public.teams at ON g.away_team_id = at.id
JOIN
    public.sports s ON g.sport_id = s.id
WHERE
    g.start_time >= CURRENT_DATE AND g.start_time < (CURRENT_DATE + INTERVAL '1 day')
ORDER BY
    g.start_time ASC;

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_hit_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET 
        correct_picks = (SELECT COUNT(*) FROM public.picks WHERE user_id = NEW.user_id AND correct = TRUE),
        total_picks = (SELECT COUNT(*) FROM public.picks WHERE user_id = NEW.user_id),
        hit_rate = CASE 
            WHEN (SELECT COUNT(*) FROM public.picks WHERE user_id = NEW.user_id) > 0 
            THEN (SELECT COUNT(*) FROM public.picks WHERE user_id = NEW.user_id AND correct = TRUE)::FLOAT / 
                 (SELECT COUNT(*) FROM public.picks WHERE user_id = NEW.user_id)::FLOAT
            ELSE 0 
        END,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_pick_update
AFTER UPDATE OF correct ON public.picks
FOR EACH ROW EXECUTE FUNCTION public.update_hit_rate();

-- Insert default sports
INSERT INTO public.sports (name, display_name, icon_url) VALUES
('NFL', 'Football', '/icons/nfl.svg'),
('NBA', 'Basketball', '/icons/nba.svg'),
('MLB', 'Baseball', '/icons/mlb.svg'),
('NHL', 'Hockey', '/icons/nhl.svg'),
('NCAAF', 'College Football', '/icons/ncaaf.svg'),
('NCAAB', 'College Basketball', '/icons/ncaab.svg');

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Public users are viewable by everyone"
ON public.users FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Sports policies
CREATE POLICY "Sports are viewable by everyone"
ON public.sports FOR SELECT
TO authenticated, anon
USING (true);

-- Teams policies
CREATE POLICY "Teams are viewable by everyone"
ON public.teams FOR SELECT
TO authenticated, anon
USING (true);

-- Games policies
CREATE POLICY "Games are viewable by everyone"
ON public.games FOR SELECT
TO authenticated, anon
USING (true);

-- Articles policies
CREATE POLICY "Articles are viewable by everyone"
ON public.articles FOR SELECT
TO authenticated, anon
USING (true);

-- Picks policies
CREATE POLICY "Users can view all picks"
ON public.picks FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can insert their own picks before lock time"
ON public.picks FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND
    (SELECT lock_time FROM public.games WHERE id = game_id) > NOW()
);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
ON public.follows FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can manage their own follows"
ON public.follows FOR INSERT, DELETE
TO authenticated
USING (auth.uid() = follower_id)
WITH CHECK (auth.uid() = follower_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
ON public.comments FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Users can insert their own comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 