import EditEnquiryForm from "@/components/enquiries/EditEnquiryForm";

export default function EditEnquiryPage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto py-6">
            <EditEnquiryForm id={params.id} />
        </div>
    );
}
