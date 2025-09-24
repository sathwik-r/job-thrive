import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import React from "react";

export interface SessionRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  sessionType: 'career-advice' | 'mock-interview' | 'technical-review' | 'project-guidance';
  startTime: string;
  duration: number;
  cost: number;
  paymentId?: string;
  orderId?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  // User data populated by backend
  mentor?: {
    id: number;
    name: string;
    email: string;
    photoUrl?: string;
    company?: string;
    position?: string;
  };
  mentee?: {
    id: number;
    name: string;
    email: string;
    photoUrl?: string;
    company?: string;
    position?: string;
  };
}
interface RequestsPanelProps {
  outgoingRequests: SessionRequest[];
  incomingRequests: SessionRequest[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
  onMessageMentor: (mentorId: string) => void;
}

export default function RequestsPanel({ 
  outgoingRequests, 
  incomingRequests, 
  onAcceptRequest, 
  onDeclineRequest, 
  onCancelRequest,
  onMessageMentor 
}: RequestsPanelProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'declined': return 'Declined';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const RequestCard = ({ request, isIncoming = false }: { request: SessionRequest; isIncoming?: boolean }) => {
    const user = isIncoming ? request.mentee : request.mentor;
    const userTitle = user?.position || user?.company || 'Professional';
    
    return (
      <Card key={request.id} className="hover-elevate" data-testid={`card-request-${request.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoUrl} alt={user?.name} />
                <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-sm" data-testid={`text-user-name-${request.id}`}>
                  {user?.name || 'Unknown User'}
                </h4>
                <p className="text-xs text-muted-foreground">{userTitle}</p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(request.status)} text-white`}
              data-testid={`badge-status-${request.id}`}
            >
              {getStatusText(request.status)}
            </Badge>
          </div>
        </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(request.startTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{request.duration} min</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {request.sessionType.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Badge>
          <span className="text-xs font-medium">${request.cost}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isIncoming && request.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onDeclineRequest(request.id.toString())}
                className="flex-1 h-8"
                data-testid={`button-decline-${request.id}`}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Decline
              </Button>
              <Button 
                size="sm"
                onClick={() => onAcceptRequest(request.id.toString())}
                className="flex-1 h-8"
                data-testid={`button-accept-${request.id}`}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Accept
              </Button>
            </>
          )}
          
          {!isIncoming && request.status === 'pending' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCancelRequest(request.id.toString())}
              className="flex-1 h-8"
              data-testid={`button-cancel-${request.id}`}
            >
              Cancel Request
            </Button>
          )}

          {(request.status === 'accepted' || request.status === 'completed') && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onMessageMentor(request.mentorId.toString())}
              className="flex-1 h-8"
              data-testid={`button-message-${request.id}`}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="panel-requests">
      <Tabs defaultValue="outgoing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="outgoing" data-testid="tab-outgoing">
            My Requests ({outgoingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="incoming" data-testid="tab-incoming">
            Incoming ({incomingRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="outgoing" className="space-y-4">
          <div className="space-y-3">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map((request) => (
                <RequestCard key={request.id} request={request} isIncoming={false} />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No outgoing requests yet.</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Start by booking a session with a mentor!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="incoming" className="space-y-4">
          <div className="space-y-3">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => (
                <RequestCard key={request.id} request={request} isIncoming={true} />
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground text-sm">No incoming requests.</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Complete your mentor profile to start receiving requests!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}