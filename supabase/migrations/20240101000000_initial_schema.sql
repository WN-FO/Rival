-- Enable necessary extensions
create extension if not exists "vector" with schema "public";

-- Create enum types
create type user_level as enum ('rookie', 'pro', 'veteran', 'elite', 'legend');
create type sport_type as enum ('nba', 'nfl', 'mlb', 'nhl', 'soccer');
create type game_status as enum ('scheduled', 'live', 'finished', 'cancelled');
create type pick_result as enum ('pending', 'win', 'loss', 'push');

-- Create tables
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    full_name text,
    avatar_url text,
    level user_level default 'rookie',
    xp integer default 0,
    wins integer default 0,
    losses integer default 0,
    streak integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint username_length check (char_length(username) >= 3)
);

-- Rest of the schema... 