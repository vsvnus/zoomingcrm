import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // BYPASS TEMPORÁRIO PARA DEBUGAR LOOP INFINITO
  // O código original de sessão foi removido temporariamente para
  // garantir que nenhum redirecionamento ocorra no servidor.
  return NextResponse.next()
}
