// import React, { useState, useEffect, useMemo } from 'react';
// import { Event, Registration, KPI } from '../../../types';
// import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
// import { Calendar, Users, UserCheck, TrendingUp, AlertCircle } from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { motion } from 'motion/react';
// import { getEvents, getUsers } from '../../../lib/api';
// import { Alert, AlertDescription } from '../../ui/alert';

// // Cores do design system
// const COLORS = {
//   primary: '#6366F1',
//   background: '#1E1E1E',
//   border: '#2A2A2A',
//   muted: '#6B7280',
//   popover: '#1A1A1A',
//   foreground: '#FFFFFF',
// };

// export function DashboardPage() {
//   const [events, setEvents] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Buscar dados da API
//   useEffect(() => {
//     async function fetchData() {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         const [eventsData, usersData] = await Promise.all([
//           getEvents(),
//           getUsers(),
//         ]);
        
//         setEvents(eventsData);
//         setUsers(usersData);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
//         console.error('Erro ao buscar dados do dashboard:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   const kpis: KPI[] = useMemo(() => {
//     // Como não temos inscrições no backend ainda, usar dados mockados
//     const activeEvents = events.length;
//     const totalParticipants = users.length;
    
//     return [
//       {
//         label: 'Eventos Ativos',
//         value: activeEvents,
//         icon: 'Calendar',
//         change: 12,
//       },
//       {
//         label: 'Usuários Cadastrados',
//         value: totalParticipants,
//         icon: 'Users',
//         change: 8,
//       },
//       {
//         label: 'Inscrições',
//         value: 0, // TODO: Aguardando endpoint de estatísticas
//         icon: 'TrendingUp',
//         change: 0,
//       },
//       {
//         label: 'Check-ins',
//         value: 0, // TODO: Aguardando endpoint de estatísticas
//         icon: 'UserCheck',
//         change: 0,
//       },
//     ];
//   }, [events, users]);

//   const chartData = useMemo(() => {
//     // Gráfico simplificado - quando tiver endpoint de estatísticas, atualizar
//     return events.slice(0, 5).map((event) => ({
//       name: event.titulo.length > 20 ? event.titulo.substring(0, 20) + '...' : event.titulo,
//       inscrições: 0, // TODO: Buscar do endpoint de estatísticas
//     }));
//   }, [events]);

//   const getIcon = (iconName: string) => {
//     switch (iconName) {
//       case 'Calendar':
//         return Calendar;
//       case 'Users':
//         return Users;
//       case 'TrendingUp':
//         return TrendingUp;
//       case 'UserCheck':
//         return UserCheck;
//       default:
//         return Calendar;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center">
//         <p className="text-muted-foreground">Carregando dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="mb-2 text-foreground">Dashboard</h1>
//         <p className="text-muted-foreground">
//           Visão geral do sistema de eventos
//         </p>
//       </div>

//       {/* Error Alert */}
//       {error && (
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {/* KPIs */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         {kpis.map((kpi, index) => {
//           const Icon = getIcon(kpi.icon);
//           return (
//             <motion.div
//               key={kpi.label}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3, delay: index * 0.1 }}
//             >
//               <Card className="border-border">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="space-y-1">
//                       <p className="text-sm text-muted-foreground">
//                         {kpi.label}
//                       </p>
//                       <p className="text-foreground">{kpi.value}</p>
//                       {kpi.change && (
//                         <p className="text-xs text-green-500">
//                           +{kpi.change}% vs. mês anterior
//                         </p>
//                       )}
//                     </div>
//                     <div className="rounded-full bg-primary/10 p-3">
//                       <Icon className="h-5 w-5 text-primary" />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* Chart */}
//       <Card className="border-border">
//         <CardHeader>
//           <CardTitle>Inscrições por Evento</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
//                 <XAxis 
//                   dataKey="name" 
//                   tick={{ fill: COLORS.muted }}
//                   stroke={COLORS.border}
//                 />
//                 <YAxis 
//                   tick={{ fill: COLORS.muted }}
//                   stroke={COLORS.border}
//                 />
//                 <Tooltip 
//                   cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
//                   contentStyle={{
//                     backgroundColor: COLORS.popover,
//                     border: `1px solid ${COLORS.border}`,
//                     borderRadius: '8px',
//                     color: COLORS.foreground,
//                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
//                   }}
//                   itemStyle={{
//                     color: COLORS.foreground,
//                   }}
//                   labelStyle={{
//                     color: COLORS.muted,
//                     marginBottom: '4px',
//                   }}
//                 />
//                 <Bar 
//                   dataKey="inscrições" 
//                   fill={COLORS.primary} 
//                   radius={[4, 4, 0, 0]}
//                   activeBar={{ fill: '#7C7FF1' }}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Recent Events */}
//       <Card className="border-border">
//         <CardHeader>
//           <CardTitle>Eventos Recentes</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {events.slice(0, 5).map((event) => (
//               <div
//                 key={event.id}
//                 className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
//               >
//                 <div className="space-y-1">
//                   <p className="text-foreground">{event.titulo}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {event.local}
//                   </p>
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   {new Date(event.data_inicio).toLocaleDateString('pt-BR')}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }