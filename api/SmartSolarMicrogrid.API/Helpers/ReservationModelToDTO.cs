using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Helpers
{
    public class ReservationModelToDTO
    {
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
