-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store long-term memories and context for the agent
create table if not exists agent_memory (
  id uuid primary key default gen_random_uuid(),
  content text not null, -- The actual text content (note, summary, fact)
  metadata jsonb default '{}'::jsonb, -- Extra info: source table, record_id, created_by, etc.
  embedding vector(1536), -- OpenAI text-embedding-3-small uses 1536 dimensions
  created_at timespamtz default now(),
  organization_id text not null -- Multi-tenant security
);

-- Create an index for faster similarity search (IVFFlat is good for speed/recall balance)
-- Note: It works best with some data already, but good to have defined.
create index on agent_memory using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Function to search for similar documents (The Core of RAG)
create or replace function search_agent_memory (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  org_id text
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    agent_memory.id,
    agent_memory.content,
    agent_memory.metadata,
    1 - (agent_memory.embedding <=> query_embedding) as similarity
  from agent_memory
  where agent_memory.organization_id = org_id
  and 1 - (agent_memory.embedding <=> query_embedding) > match_threshold
  order by agent_memory.embedding <=> query_embedding
  limit match_count;
end;
$$;
