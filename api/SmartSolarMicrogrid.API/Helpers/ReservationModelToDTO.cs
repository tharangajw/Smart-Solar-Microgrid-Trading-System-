using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;
/*
 * File: ReservationModelToDTO.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */

namespace SmartSolarMicrogrid.API.Helpers
{
    public class ReservationModelToDTO
    {
// Handles the MapToDto operation.
        public ReservationResponseDto MapToDto(Reservation r)
        {
            return new ReservationResponseDto
            {
                Id = r.Id,
                ProsumerNic = r.ProsumerNic,
                SlotId = r.SlotId,
                NodeId = r.NodeId,
                ReservationDate = r.ReservationDate,
                Status = r.Status,
                QrCodeId = r.QrCodeId,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                CancelledReason = r.CancelledReason
            };
        }
    }
}
